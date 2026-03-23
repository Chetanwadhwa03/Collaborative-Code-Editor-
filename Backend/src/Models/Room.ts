import mongoose, { model, Schema } from "mongoose";

const Roomschema = new Schema({
   roomname:{type:String,required:true},
   roomId:{type:String, required:true, unique:true},
   ownerId:{type:mongoose.Schema.Types.ObjectId , ref:'User'},
   content:{type:String}
   
})

const Roommodel = model('rooms',Roomschema);
export default Roommodel;