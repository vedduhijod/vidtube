import mongoose, {Schema} from "mongoose";


const subscriptionSchema = new Schema(
    {
        subscriber: {
            type: String,
            ref: "User"
        },
        channel: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
    },
    {
        timestamps: true,
    }
);      


export default mongoose.model("Subscription", subscriptionSchema);