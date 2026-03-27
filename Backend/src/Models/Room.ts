import mongoose, { model, Schema } from "mongoose";

const Roomschema = new Schema({
   roomname:{type:String,required:true},
   roomId:{type:String, required:true, unique:true},
   ownerId:{type:mongoose.Schema.Types.ObjectId , ref:'User'},
   content:{type:String}
   
})

// Compound index validation. that the combination of these 2 values should be unique.
Roomschema.index({roomname:1,ownerId:1},{unique:true});

const Roommodel = model('rooms',Roomschema);
export default Roommodel;