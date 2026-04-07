import mongoose from "mongoose";
declare const Roommodel: mongoose.Model<{
    roomname: string;
    roomId: string;
    ownerId?: mongoose.Types.ObjectId | null;
    content?: string | null;
}, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    roomname: string;
    roomId: string;
    ownerId?: mongoose.Types.ObjectId | null;
    content?: string | null;
}, {
    id: string;
}, mongoose.DefaultSchemaOptions> & Omit<{
    roomname: string;
    roomId: string;
    ownerId?: mongoose.Types.ObjectId | null;
    content?: string | null;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    roomname: string;
    roomId: string;
    ownerId?: mongoose.Types.ObjectId | null;
    content?: string | null;
}, mongoose.Document<unknown, {}, {
    roomname: string;
    roomId: string;
    ownerId?: mongoose.Types.ObjectId | null;
    content?: string | null;
}, {
    id: string;
}, mongoose.DefaultSchemaOptions> & Omit<{
    roomname: string;
    roomId: string;
    ownerId?: mongoose.Types.ObjectId | null;
    content?: string | null;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, unknown, {
    roomname: string;
    roomId: string;
    ownerId?: mongoose.Types.ObjectId | null;
    content?: string | null;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    roomname: string;
    roomId: string;
    ownerId?: mongoose.Types.ObjectId | null;
    content?: string | null;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export default Roommodel;
//# sourceMappingURL=Room.d.ts.map