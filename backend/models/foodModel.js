import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
    name: {type:String,required:true},
    description: {type:String,required:true},
    price: {type:Number,required:true},
    image: {type:String,required:true},
    category: {type:String,required:true},
    inStock: {type:Boolean, required:true, default:true},
    customizations: {
        type: [{
            name: { type: String, required: true },
            options: [{
                name: { type: String, required: true },
                price: { type: Number, required: true, default: 0 }
            }]
        }],
        default: []
    }
})

const foodModel = mongoose.models.food || mongoose.model("food",foodSchema)

export default foodModel;