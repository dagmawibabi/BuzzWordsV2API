import { Hono } from "hono";
import { UserModel } from "../models/user_model.js";

const app = new Hono();

//* INTRODUCTION
var welcomeMessage = "Auth";
app.get("/", (c) => {
  return c.text(welcomeMessage);
});

//* USER LOGIN
app.post("/login", async (c) => {
  try {
    const { username, password } = await c.req.json();

    // Find user by username
    const user = await UserModel.findOne({ username }).select("+password");

    // Check if user exists
    if (!user) {
      return c.json(
        {
          success: false,
          message: "Invalid username",
        },
        401
      );
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return c.json(
        {
          success: false,
          message: "Invalid password",
        },
        401
      );
    }

    // Return success response with user data (excluding password)
    const { password: _, ...userWithoutPassword } = user.toObject();
    return c.json({
      success: true,
      message: "Login successful",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Login error:", error);
    return c.json(
      {
        success: false,
        message: "Error during login",
        error: error,
      },
      500
    );
  }
});

//* USER SIGNUP
app.post("/signup", async (c) => {
  try {
    const { firstName, lastName, username, email, password } =
      await c.req.json();

    // Create new user
    const newUser = new UserModel({
      firstName,
      lastName,
      username,
      email,
      password,
    });

    // Save user to database
    const savedUser = await newUser.save();

    // Return success
    const { password: _, ...userWithoutPassword } = savedUser.toObject();
    return c.json({
      success: true,
      message: "User created successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Signup error:", error);

    return c.json({
      success: false,
      message: "Error creating user",
      error: error,
    });
  }
});

export default app;
