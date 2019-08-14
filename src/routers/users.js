const express = require("express");
const { User, userSchemaFields } = require("../models/user");
const sharp = require("sharp");
const multer = require("multer");
const auth = require("../middleware/auth");
const {
  sendWelcomeEmail,
  sendCancellationEmail
} = require("../emails/account");
const router = new express.Router();

const upload = multer({
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error("File must be an image - jpg / jpeg / png / gif"));
    }
    return cb(undefined, true);
  }
});

router.get("/me", auth, async (req, res) => {
  res.send(req.user);
});

router.post("/", async (req, res) => {
  const user = new User(req.body);
  try {
    const newUser = await user.save();
    sendWelcomeEmail(newUser.email, newUser.name);
    const token = await user.generateAuthToken();
    return res.status(201).send({ user: newUser, token });
  } catch (err) {
    return res.status(400).send(err.message);
  }
});

router.post(
  "/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .png()
      .resize({ width: 250, height: 250 })
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.delete("/me/avatar", auth, async (req, res) => {
  try {
    if (!req.user.avatar) {
      return res.status(400).send();
    }
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
  } catch (err) {
    res.status(500).send();
  }
});

router.get("/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error();
    }

    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (err) {
    res.status(404).send();
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    return res.status(200).send({ user, token });
  } catch (err) {
    return res.status(400).send(err.message);
  }
});

router.post("/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      tokenObj => tokenObj.token !== req.token
    );
    await req.user.save();
    res.send();
  } catch (err) {
    res.status(500).send();
  }
});

router.post("/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (err) {
    res.status(500).send();
  }
});

router.patch("/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const isValidOperation = updates.every(update =>
    userSchemaFields.includes(update)
  );
  if (!isValidOperation) {
    return res.status(400).send("invalid update entries!");
  }

  try {
    updates.forEach(update => (req.user[update] = req.body[update]));
    await req.user.save();

    return res.status(200).send(req.user);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

router.delete("/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    sendCancellationEmail(req.user.email, req.user.name);
    return res.status(200).send(req.user);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

module.exports = router;
