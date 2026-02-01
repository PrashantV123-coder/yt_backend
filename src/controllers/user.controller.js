import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    //get user details from frontend
    //validation - not empty
    //check if user already exists : username, email
    //check for img, avatar
    //upload them to cloudinary, avatar
    //create user obj - create entry in db
    //remove password and refresh token fields from response
    //check for user creation
    //return res


    //get user details from frontend
    const { fullName, email, username, password } = req.body;

    //validation - not empty
    if(
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required");
    }

    //check if user already exists : username, email
    const existedUser = User.findOne({
        $or: [{username}, {email}]
    });

    if(existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    };

    //check for img, avatar
    const avatarLocalPath = req.file?.avatar[0]?.path;
    const coverImageLocalPath = req.file?.coverImage[0]?.path;

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    };

    //upload them to cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar) {
        throw new ApiError(400, "Avatar is requireq");
    };

    //create user obj - create entry in db
    const user = await User.create({
        fullName, 
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    });

    //remove password and refresh token fields from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    //check for created user
    if(!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user");
    };

    //return res
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    );
    
});

export {registerUser};