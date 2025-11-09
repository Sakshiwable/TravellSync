// controllers/groupController.js
import Group from "../models/Group.js";
import GroupMember from "../models/GroupMember.js";
import FriendRequest from "../models/FriendRequest.js";
import User from "../models/User.js";
import { sendInviteEmail } from "../utils/mailer.js"; 

// 🧾 Create a new group
export const createGroup = async (req, res) => {
  try {
    const { groupName, destination } = req.body;

    // create new group
    const group = await Group.create({
      groupName,
      destination,
      createdBy: req.userId,
      members: [req.userId],
    });

    // make creator an admin in GroupMember
    await GroupMember.create({
      groupId: group._id,
      userId: req.userId,
      role: "admin",
      isOnline: false,
    });

    res.status(201).json({ message: "Group created successfully!", group });
  } catch (error) {
    res.status(500).json({ message: "Error creating group", error: error.message });
  }
};

// 💌 Send invite to friend (using groupName instead of groupId)
export const inviteFriend = async (req, res) => {
  try {
    const { groupName, email } = req.body;

    // 1️⃣ Find the group
    const group = await Group.findOne({ groupName });
    if (!group) return res.status(404).json({ message: "Group not found." });

    // 2️⃣ Find the user
    const friend = await User.findOne({ email });
    if (!friend) return res.status(404).json({ message: "User not found." });

    // 3️⃣ Check if invite already exists
    const existingInvite = await FriendRequest.findOne({
      fromUserId: req.userId,
      toUserId: friend._id,
      groupId: group._id,
    });
    if (existingInvite)
      return res.status(400).json({ message: "Invite already sent." });

    // 4️⃣ Create invite
    await FriendRequest.create({
      fromUserId: req.userId,
      toUserId: friend._id,
      groupId: group._id,
      status: "pending",
    });

    // 5️⃣ Send email notification
    await sendInviteEmail(friend.email, groupName, req.user?.name || "Your friend");

    res.status(201).json({
      message: `Invitation sent for group '${groupName}' and email delivered to ${friend.email}!`,
    });
  } catch (error) {
    console.error("❌ Error sending invite:", error.message);
    res.status(500).json({ message: "Error sending invite", error: error.message });
  }
};


// ✅ Accept group invite
export const acceptInvite = async (req, res) => {
  try {
    const { inviteId, groupId } = req.body;

    // Mark invite as accepted
    await FriendRequest.findByIdAndUpdate(inviteId, { status: "accepted" });

    // Add the user to the group
    await GroupMember.create({
      groupId,
      userId: req.userId,
      role: "member",
    });

    res.status(200).json({ message: "Invite accepted and joined group!" });
  } catch (error) {
    console.error("❌ Error accepting invite:", error.message);
    res.status(500).json({ message: "Error accepting invite" });
  }
};


// 👥 Get all members of a group
export const getGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;

    const members = await GroupMember.find({ groupId })
      .populate("userId", "name email") // ✅ important
      .sort({ role: 1 }); // admins first

    if (!members) {
      return res.status(404).json({ message: "No members found" });
    }

    res.status(200).json({ members });
  } catch (error) {
    console.error("Error fetching group members:", error.message);
    res.status(500).json({ message: "Failed to load group members" });
  }
};

// ✅ Get all groups created by or joined by the user
export const getUserGroups = async (req, res) => {
  try {
    const userId = req.userId;

    // Groups user created
    const createdGroups = await Group.find({ createdBy: userId });

    // Groups user is a member of
    const memberGroupsData = await GroupMember.find({ userId })
      .populate("groupId");

    const memberGroups = memberGroupsData
      .map((m) => m.groupId)
      .filter(Boolean); // remove nulls

    // Merge + remove duplicates
    const allGroups = [...createdGroups, ...memberGroups].filter(
      (group, index, self) =>
        index === self.findIndex((g) => g._id.toString() === group._id.toString())
    );

    res.status(200).json({ groups: allGroups });
  } catch (error) {
    console.error("❌ Error fetching user groups:", error.message);
    res.status(500).json({ message: "Error fetching groups", error: error.message });
  }
};