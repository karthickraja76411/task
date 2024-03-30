import { Router } from 'express';
import { UserModal } from "../modal/signSchema.js";
import bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import { uploads } from '../middlewares/uploadFile.js';
import fs from "fs";
import { fileURLToPath } from 'url';
import spath from "path";
import nodemailer from "nodemailer";
import emailExistence from "email-existence";


export const userRouter = Router();

userRouter.get("/index", async (req, res) => {
    try {
        const data = await UserModal.find().where({ status: 1 });
        return res.json({ data: data })
    } catch (err) {
        res.status(400).json({ status: 0, message: err.message });
    }
});

userRouter.post("/add", uploads.single("profileImg"), async (req, res) => {
    try {
        const { name, email, password, phoneNumber, profileImg } = req.body;
        if (typeof name !== "undefined" && name !== "" && typeof email !== "undefined" && email !== "" && typeof password !== "undefined" && password !== "") {
            const findEmail = await UserModal.find({ $or: [{ email }, { phoneNumber }] })
            if (findEmail.length === 0) {

                const transpoter = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                        user: "pistolpd19@gmail.com",
                        pass: "nzmd dcvy dgac puzu"
                    },
                    tls: {
                        rejectUnauthorized: false
                    },

                })

                const mailOptions = {
                    from: 'pistolpd19@gmail.com',
                    to: email,
                    subject: 'Verification',
                    html: `
                      <p>Hello ${name},</p>
                      <p>It's simple verification for our side</p>
                    `,
                    dsn: {
                        id: Math.random() * 10000000000,
                        return: 'headers',
                        notify: ['failure', 'delay'],
                        recipient: 'sender@example.com'
                    }
                };
                emailExistence.check(email, function (error, response) {
                    if (response) {
                        transpoter.sendMail(mailOptions, async (err, info) => {
                            if (err) throw err;
                            else {
                                if (req.file) {
                                    const { path, originalname } = req.file;
                                    const extName = originalname.split(".")[1];
                                    const randomNum = Date.now();
                                    const newFileName = `${name}_${randomNum}.${extName}`;
                                    var convertedFilePath = `/upload/userProfiles/${name}/${newFileName}`;
                                    // Rename the File Name
                                    const __filename = fileURLToPath(import.meta.url);
                                    const dir = spath.join(spath.dirname(__filename), '..',);
                                    fs.rename(path, dir + convertedFilePath, (err) => {
                                        if (err) { console.log("error in File Rename", err.message); }
                                    })
                                }
                                var hashPaswword = bcrypt.hashSync(password, 10);
                                const insertQuery = new UserModal({ name, email, password: hashPaswword, phoneNumber, profileImg: convertedFilePath });
                                await insertQuery.save();
                                return res.status(200).json({ status: 1, message: "User created successfully" })
                            }
                        })
                    } else {
                        fs.unlink(req.file.path, (err) => {
                            if (err) { console.log("error in unlink", err.message); }
                        })
                        return res.status(400).json({ status: 0, message: "It's not valid email" });
                    }
                });



            } else {
                return res.status(400).json({ status: 0, message: "User already exists" });
            }
        } else {
            return res.status(400).json({ status: 0, message: "Missing required fields" });
        }
    } catch (err) {
        res.status(400).json({ status: 0, message: err.message });
    }
});

userRouter.put("/update/:id", uploads.single("profileImg"), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phoneNumber, profileImg } = req.body;
        if (typeof id !== "undefined" && id !== "") {
            const findUser = await UserModal.find({ $and: [{ status: 1 }, { _id: id }] })
            if (findUser.length !== 0) {
                const data = findUser[0];
                if (req.file) {
                    const __filename = fileURLToPath(import.meta.url);
                    const dir = spath.join(spath.dirname(__filename), '..',);
                    fs.unlink(spath.join(dir, data.profileImg), (err) => {
                        if (err) { console.log("error in unlink", err.message); }
                    })

                    const { path, originalname } = req.file;
                    const extName = originalname.split(".")[1];
                    const randomNum = Date.now();
                    const newFileName = `${name}_${randomNum}.${extName}`;
                    var convertedFilePath = `/upload/userProfiles/${name}/${newFileName}`;
                    fs.rename(path, dir + convertedFilePath, (err) => {
                        if (err) { console.log("error in File Rename", err.message); }
                    })
                }

                var uName = name || data.name;
                var uNEmail = email || data.email;
                var uPhone = phoneNumber || data.phoneNumber;
                var uProfile = convertedFilePath || data.profileImg;
                await UserModal.updateOne({ _id: id }, { $set: { name: uName, email: uNEmail, phoneNumber: uPhone, profileImg: uProfile } })
                return res.status(200).json({ status: 1, message: "User updated successfully" })
            } else {
                return res.status(400).json({ status: 0, message: "User not found" });
            }
        } else {
            return res.status(400).json({ status: 0, message: "Missing ID" });
        }
    } catch (err) {
        res.status(400).json({ status: 0, message: err.message });
    }
});

userRouter.delete("/delete/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (typeof id !== "undefined" && id !== "") {
            const findUser = await UserModal.find({ $and: [{ status: 1 }, { _id: id }] })
            if (findUser.length !== 0) {

                const __filename = fileURLToPath(import.meta.url);
                const dir = spath.join(spath.dirname(__filename), '..',);

                var deleteFolderRecursive = function (path) {
                    if (fs.existsSync(path)) {
                        fs.readdirSync(path).forEach(function (file, index) {
                            var curPath = path + "/" + file;
                            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                                deleteFolderRecursive(curPath);
                            } else { // delete file
                                fs.unlinkSync(curPath);
                            }
                        });
                        fs.rmdirSync(path);
                    }
                };

                deleteFolderRecursive(spath.join(dir, `/upload/userProfiles/${findUser[0].name}`));

                await UserModal.deleteOne({ _id: id })
                return res.status(200).json({ status: 1, message: "User deleted successfully" })
            } else {
                return res.status(400).json({ status: 0, message: "User not found" });
            }
        } else {
            return res.status(400).json({ status: 0, message: "Missing ID" });
        }
    } catch (err) {
        res.status(400).json({ status: 0, message: err.message });
    }
});

userRouter.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        if (typeof username !== "undefined" && username !== "" && typeof password !== "undefined" && password !== "") {
            const findUser = await UserModal.find({ phoneNumber: username });
            if (findUser.length !== 0) {
                const data = findUser[0];
                var verifyPassword = bcrypt.compareSync(password, data.password);
                if (!verifyPassword) return res.status(400).json({ status: 0, message: "Password is incorrect" });
                else {
                    const token = jsonwebtoken.sign(
                        { id: data._id, email: data.email, phoneNumber: data.phoneNumber },
                        "test@gmail.com",
                        { expiresIn: "1h" }
                    );
                    return res.status(200).json({
                        id: data._id,
                        name: data.name,
                        email: data.email,
                        phoneNumber: data.phoneNumber,
                        profileImg: data.profileImg,
                        token
                    });
                }

            } else {
                return res.status(400).json({ status: 0, message: "User not found" });
            }
        } else {
            return res.status(400).json({ status: 0, message: "Missing required fields" });
        }
    } catch (err) {
        return res.status(400).json({ status: 0, message: err.message });
    }
});
