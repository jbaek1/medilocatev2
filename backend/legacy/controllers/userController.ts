import { Request, Response } from "express";
import User from "../models/userModel";

// @desc    Get or create a user
// @route   POST /api/users
// @access  Public
export const getOrCreateUser = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { firebaseId, name, email, medications, gender, dateofbirth, pregnant } = req.body;

		let user = await User.findOne({ firebaseId });

		if (user) {
			res.status(200).json({ user, message: "User already exists" });
			return;
		}

		const newUser = new User({
			firebaseId,
			name,
			email,
			medications,
			gender,
			dateofbirth,
			pregnant,
		});

		const savedUser = await newUser.save();
		res.status(201).json({ user: savedUser, message: "User created successfully" });
	} catch (error) {
		res.status(400).json({ message: "Failed to get or create user", error });
	}
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
export const getUserById = async (req: Request, res: Response): Promise<void> => {
	try {
		const { id } = req.params;
		const user = await User.findById(id);

		if (!user) {
			res.status(404).json({ message: "User not found" });
			return;
		}

		res.status(200).json(user);
	} catch (error) {
		res.status(400).json({ message: "Failed to retrieve user", error });
	}
};

// @desc    Update user information
// @route   PUT /api/users/:id
// @access  Public
export const updateUser = async (req: Request, res: Response): Promise<void> => {
	try {
		const { id } = req.params;
		const updates = req.body;

		const updatedUser = await User.findByIdAndUpdate(id, updates, {
			new: true,
			runValidators: true,
		});

		if (!updatedUser) {
			res.status(404).json({ message: "User not found" });
			return;
		}

		res.status(200).json({ user: updatedUser, message: "User updated successfully" });
	} catch (error) {
		res.status(400).json({ message: "Failed to update user", error });
	}
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Public
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
	try {
		const { id } = req.params;

		const user = await User.findById(id);

		if (!user) {
			res.status(404).json({ message: "User not found." });
			return;
		}

		await User.deleteOne({ _id: id });

		res.status(200).json({ message: "User deleted successfully." });
	} catch (error) {
		res.status(500).json({ message: "Internal server error.", error });
	}
};
// @desc    Update user medications (append and remove medications)
// @route   PATCH /api/users/:id/medications
// @access  Public
export const updateMedications = async (req: Request, res: Response): Promise<void> => {
	try {
		const { id } = req.params;
		const { medicationsToAdd, medicationsToRemove } = req.body;

		// Find the user by id
		const user = await User.findById(id);
		if (!user) {
			res.status(404).json({ message: "User not found." });
			return;
		}
		// Remove specified medications from the user's medications list
		if (Array.isArray(medicationsToRemove)) {
			user.medications = user.medications.filter((med: string) => !medicationsToRemove.includes(med));
		}
		// Append new medications, ensuring no duplicates
		if (Array.isArray(medicationsToAdd)) {
			medicationsToAdd.forEach((newMed: string) => {
				if (!user.medications.includes(newMed)) {
					user.medications.push(newMed);
				}
			});
		}
		// Save the updated user document
		const updatedUser = await user.save();
		res.status(200).json({ user: updatedUser, message: "Medications updated successfully." });
	} catch (error) {
		res.status(400).json({ message: "Failed to update medications", error });
	}
};