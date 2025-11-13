import * as photoService from "#root/services/photoService.js";
import HttpError from "#root/helpers/HttpError.js";

export const uploadPhoto = async (req, res) => {
  if (!req.file) {
    throw HttpError(400, "No file uploaded");
  }

  const { auditId, answerId } = req.body;
  const userId = req.user.id;

  if (!auditId) {
    throw HttpError(400, "auditId is required");
  }

  const photo = await photoService.uploadAuditPhoto({
    fileBuffer: req.file.buffer,
    auditId,
    answerId: answerId || null,
    userId,
    meta: {
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
    },
  });

  res.status(201).json(photo);
};

export const deletePhoto = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  await photoService.deletePhoto(id, userId);

  res.status(204).send();
};

export const getAuditPhotos = async (req, res) => {
  const { auditId } = req.params;

  const photos = await photoService.getAuditPhotos(auditId);

  res.json(photos);
};

export const getAnswerPhotos = async (req, res) => {
  const { answerId } = req.params;

  const photos = await photoService.getAnswerPhotos(answerId);

  res.json(photos);
};
