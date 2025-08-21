import { response } from "express";
import orderModel from "../models/orderModel.js";
import userModel from  '../models/userModel.js'
import axios from "axios"
import crypto from "crypto"
import nodemailer from "nodemailer"

// Paystack configuration
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// WhatsApp Business API configuration
const WHATSAPP_PHONE_NUMBER = process.env.WHATSAPP_PHONE_NUMBER || '+233205486812';

// Email configuration
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;


//placing user order for front end

const placeOrder = async (req,res) => {

    const frontend_url = process.env.NODE_ENV === 'production' 
  ? "https://oud-restaurant-4nt0.onrender.com" 
  : "http://localhost:5173"
  try {
    // Check for recent duplicate orders (within last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const existingOrder = await orderModel.findOne({
      userId: req.body.userId,
      amount: req.body.amount,
      date: { $gte: fiveMinutesAgo },
      items: { $size: req.body.items.length }
    });
    
    if (existingOrder) {
      return res.json({success: false, message: "Duplicate order detected. Please wait before placing another order."});
    }
    
    const newOrder = new orderModel({
            userId:req.body.userId,
            items:req.body.items,
            amount:req.body.amount,
            address:req.body.address,
            promoCode: req.body.promoCode || null
        })
    await newOrder.save();
    await userModel.findByIdAndUpdate(req.body.userId,{cartData:{}});

    // Send WhatsApp notification to admin
    await sendWhatsAppNotification(newOrder);

    // Apply promo code if provided
    if (req.body.promoCode) {
      try {
        const Promo = (await import('../models/promoModel.js')).default;
        const promo = await Promo.findOne({ 
          code: req.body.promoCode.toUpperCase(),
          isActive: true
        });
        
        if (promo && new Date() <= promo.validUntil && promo.usedCount < promo.maxUses) {
          promo.usedCount += 1;
          await promo.save();
        }
      } catch (error) {
        console.error('Error applying promo code:', error);
      }
    }

        // Calculate total amount in pesewas (Paystack expects amount in kobo)
        const totalAmount = Math.round(req.body.amount * 100); // Convert to pesewas

        // Create Paystack transaction
        const paystackData = {
            amount: totalAmount,
            email: req.body.address.email,
            currency: "GHS",
            callback_url: `${frontend_url}/verify.html`,
            metadata: {
                order_id: newOrder._id.toString(),
                custom_fields: [
                    {
                        display_name: "Order ID",
                        variable_name: "order_id",
                        value: newOrder._id.toString()
                    }
                ]
            }
        };

        const paystackResponse = await axios.post(
            `${PAYSTACK_BASE_URL}/transaction/initialize`,
            paystackData,
            {
                headers: {
                    'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (paystackResponse.data.status) {
            res.json({
                success: true,
                authorization_url: paystackResponse.data.data.authorization_url,
                reference: paystackResponse.data.data.reference
            });
        } else {
            throw new Error('Paystack initialization failed');
        }
  } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
  }
}

const verifyOrder = async (req,res) => {
    const {reference} = req.body;
    console.log("Verifying payment with reference:", reference);
    
  try {
        if (!reference) {
            console.log("No reference provided");
            return res.json({success: false, message: "No reference provided"});
        }

        // Verify payment with Paystack
        const paystackResponse = await axios.get(
            `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
            {
                headers: {
                    'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`
                }
            }
        );

        console.log("Paystack response:", paystackResponse.data);

        if (paystackResponse.data.status && paystackResponse.data.data.status === 'success') {
            const orderId = paystackResponse.data.data.metadata.order_id;
            console.log("Payment successful for order:", orderId);
            
            // Update order payment status
            const updatedOrder = await orderModel.findByIdAndUpdate(orderId, {payment: true}, {new: true});
            
            // Send email invoice to customer
            if (updatedOrder) {
                await sendEmailInvoice(updatedOrder);
            }
            
            res.json({success: true, message: "Payment verified successfully"});
        } else {
            console.log("Payment verification failed. Response details:");
            console.log("- Status:", paystackResponse.data.status);
            console.log("- Data status:", paystackResponse.data.data?.status);
            console.log("- Message:", paystackResponse.data.message);
            console.log("- Gateway response:", paystackResponse.data.data?.gateway_response);
            res.json({success: false, message: "Payment verification failed"});
        }
  } catch (error) {
        console.log("Error verifying payment:", error.response?.data || error.message);
        res.json({success: false, message: "Error verifying payment"});
  }
}

//user order for frontend

const userOrders = async (req,res) => {
  try {
        const orders = await orderModel.find({userId:req.body.userId}).sort({date: -1});
        res.json({success:true,data:orders})
  } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
  }
}

//list order for admin
const listOrders = async (req,res) => {
  try {
    const orders = await orderModel.find({});
        res.json({success:true,data:orders})
  } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
  }
}

//api for updating order status

const updateStatus = async (req,res) => {
  try {
        await orderModel.findByIdAndUpdate(req.body.orderId,{status:req.body.status});
        res.json({success:true,message:"Status Updated"})
  } catch (error) {
        console.log(error);
        res.json({success:false, message:"Error"})
        
  }
}

// Webhook handler for Paystack
const webhookHandler = async (req, res) => {
    const hash = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY).update(JSON.stringify(req.body)).digest('hex');
    
    if (hash !== req.headers['x-paystack-signature']) {
        return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    console.log('Webhook event:', event.event);

    if (event.event === 'charge.success') {
        const transaction = event.data;
        const orderId = transaction.metadata.order_id;
        
        try {
            const updatedOrder = await orderModel.findByIdAndUpdate(orderId, { payment: true }, {new: true});
            console.log('Payment confirmed for order:', orderId);
            
            // Send email invoice to customer
            if (updatedOrder) {
                await sendEmailInvoice(updatedOrder);
            }
        } catch (error) {
            console.error('Error updating order:', error);
        }
    }

    res.json({ received: true });
};

// Send WhatsApp notification
const sendWhatsAppNotification = async (order) => {
  try {
    // Format the message
    const message = `🆕 *NEW ORDER RECEIVED*

📋 *Order ID:* #${order._id.slice(-6).toUpperCase()}
👤 *Customer:* ${order.address.name}
📧 *Email:* ${order.address.email}
📱 *Phone:* ${order.address.phone}
📍 *Location:* ${order.address.location}

🍽️ *Order Items:*
${order.items.map(item => `• ${item.name} x${item.quantity} - ₵${item.price * item.quantity}`).join('\n')}

💰 *Total Amount:* ₵${order.amount}
🎫 *Promo Code:* ${order.promoCode || 'None'}

⏰ *Order Time:* ${new Date(order.date).toLocaleString('en-GH')}

Please process this order promptly! 🚀`;

    // For now, we'll log the message. You'll need to integrate with WhatsApp Business API
    console.log('WhatsApp Notification:', message);
    
    // TODO: Integrate with WhatsApp Business API
    // Example: await axios.post('your-whatsapp-api-endpoint', { message, phone: WHATSAPP_PHONE_NUMBER });
    
  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
  }
};

// Send email invoice
const sendEmailInvoice = async (order) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
      }
    });

    // Create HTML invoice
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Invoice - Oud Restaurant</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #7c3aed; padding-bottom: 20px; margin-bottom: 30px; }
          .order-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th, .items-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          .items-table th { background: #7c3aed; color: white; }
          .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍽️ Oud Restaurant</h1>
            <h2>Order Invoice</h2>
          </div>
          
          <div class="order-details">
            <h3>Order Information</h3>
            <p><strong>Order ID:</strong> #${order._id.slice(-6).toUpperCase()}</p>
            <p><strong>Date:</strong> ${new Date(order.date).toLocaleDateString('en-GH')}</p>
            <p><strong>Time:</strong> ${new Date(order.date).toLocaleTimeString('en-GH')}</p>
          </div>
          
          <div class="customer-details">
            <h3>Customer Information</h3>
            <p><strong>Name:</strong> ${order.address.name}</p>
            <p><strong>Email:</strong> ${order.address.email}</p>
            <p><strong>Phone:</strong> ${order.address.phone}</p>
            <p><strong>Delivery Location:</strong> ${order.address.location}</p>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>₵${item.price}</td>
                  <td>₵${item.price * item.quantity}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="total">
            <p><strong>Subtotal:</strong> ₵${(order.amount - 5).toFixed(2)}</p>
            <p><strong>Delivery Fee:</strong> ₵5.00</p>
            ${order.promoCode ? `<p><strong>Discount (${order.promoCode}):</strong> -₵${((order.amount - 5) * 0.1).toFixed(2)}</p>` : ''}
            <p><strong>Total Amount:</strong> ₵${order.amount}</p>
          </div>
          
          <div class="footer">
            <p>Thank you for choosing Oud Restaurant!</p>
            <p>For any questions, please contact us at +233 205 48 6812</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Email options
    const mailOptions = {
      from: EMAIL_USER,
      to: order.address.email,
      subject: `Order Invoice - #${order._id.slice(-6).toUpperCase()} - Oud Restaurant`,
      html: invoiceHTML
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log('Email invoice sent successfully to:', order.address.email);
    
  } catch (error) {
    console.error('Error sending email invoice:', error);
  }
};

export {placeOrder,verifyOrder,userOrders,listOrders,updateStatus,webhookHandler,sendWhatsAppNotification,sendEmailInvoice}
