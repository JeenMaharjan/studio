const User = require("../models/user.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { nanoid } = require("nanoid");
const AWS = require("aws-sdk");

const awsConfig = {
    accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
    region: process.env.MY_REGION,
    apiVersion: process.env.AWS_API_VERSION,
  };
  const SES = new AWS.SES(awsConfig);

exports.register = async(req, res) => {
    console.log(req.body);
    const { username, email, password } = req.body;
    // validation
    if (!username) return res.status(400).send("Name is required");
    if (!password || password.length < 6)
        return res
            .status(400)
            .send("Password is required and should be min 6 characters long");
    let userExist = await User.findOne({ email });
    if (userExist) return res.status(400).send("Email is taken");
    // register
    const user = new User(req.body);
    try {
        await user.save();
        console.log("USER CREATED", user);
        return res.json({ ok: true });
    } catch (err) {
        console.log("CREATE USER FAILED", err);
        return res.status(400).send("Error. Try again.");
    }
};

exports.login = async(req, res) => {
    // console.log(req.body);
    const { username, password } = req.body;
    try {
        // check if user with that email exist
        let user = await User.findOne({ username });
        // console.log("USER EXIST", user);
        if (!user) return res.status(400).send(`${username} not found`);
        // compare password
        user.comparePassword(password, (err, match) => {
            console.log("COMPARE PASSWORD IN LOGIN ERR", err);
            if (!match || err) return res.status(400).send("Wrong password");
            // GENERATE A TOKEN THEN SEND AS RESPONSE TO CLIENT
            let token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
                expiresIn: "5h",
            });
            res.json({
                token,
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                },
            });
        });
    } catch (err) {
        console.log("LOGIN ERROR", err);
        res.status(400).send("Signin failed");
    }
};


exports.changepassword = async (req, res) => {
    const { username, oldPassword, newPassword } = req.body;

    try {
        // Find the user by username
        const user = await User.findOne({ username });

        if (!user) {
            console.log('User not found')
            return res.status(404).json({ error: 'User not found' });
        }

        // Compare the old password with the stored hashed password
        user.comparePassword(oldPassword, async (err, isMatch) => {
            if (err || !isMatch) {
                return res.status(404).json({ error: 'Old password is incorrect' });
                
            }

            // Update the user's password with the new hashed password
            user.password = newPassword;
            await user.save();

            return res.status(200).json({ message: 'Password changed successfully' });
        });
    } catch (error) {
        console.error('Change Password Error:', error);
        return res.status(400).json({ error: 'Internal Server Error' });
    }
};

exports.masterpassword = async (req, res) => {
    const { masterPassword } = req.body;

    try {
        // Find the user by ID or username, depending on your use case
        const user = await User.findById(req.user._id); // Assuming you're using JWT and storing user details in req.user

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Hash the masterPassword and save it
        bcrypt.hash(masterPassword, 12, async (err, hash) => {
            if (err) {
                console.log("BCRYPT HASH ERR ", err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            user.masterPassword = hash;
            await user.save();

            return res.status(200).json({ message: 'Master password changed successfully' });
        });
    } catch (error) {
        console.error('Change Master Password Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.sendMessage = async (req, res) => {
    const {name , email , desc} = req.body
    try {
        const params = {
            Source: process.env.EMAIL_FROM,
            Destination: {
              ToAddresses: [process.env.EMAIL_FROM],
            },
            Message: {
              Body: {
                Html: {
                  Charset: "UTF-8",
                  Data: `
                      <html>
                        <h1>Contact Message</h1>
                        <p>Message From ${email} by ${name} :</p>
                        <h2 style="color:red;">${desc}</h2>
                        <i>imagetechstudio.com.np</i>
                      </html>
                    `,
                },
              },
              Subject: {
                Charset: "UTF-8",
                Data: "Contact Message",
              },
            },
          };
      
          const emailSent = SES.sendEmail(params).promise();
          emailSent
            .then((data) => {
              console.log(data);
              res.json({ ok: true });
            })
            .catch((err) => {
              console.log(err);
            });
    } catch (error) {
        
    }
    
}




