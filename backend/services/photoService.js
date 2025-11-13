import cloudinary from "#root/config/cloudinary.js";
import { Photo, Audit, Answer } from "#root/db/models/index.js";
import HttpError from "#root/helpers/HttpError.js";

export async function uploadToCloudinary(fileBuffer, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || "field-ops/audits",
        resource_type: "image",
        transformation: [
          { width: 1280, crop: "limit" },
          { quality: "auto:good" },
        ],
        ...options,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
}

export function generateThumbnailUrl(publicId) {
  return cloudinary.url(publicId, {
    width: 300,
    height: 300,
    crop: "fill",
    quality: "auto:low",
    fetch_format: "auto",
  });
}

export async function uploadAuditPhoto({
  fileBuffer,
  auditId,
  answerId = null,
  userId,
  meta = {},
}) {
  const audit = await Audit.findByPk(auditId);
  if (!audit) {
    throw HttpError(404, "Audit not found");
  }

  if (answerId) {
    const answer = await Answer.findOne({
      where: { id: answerId, auditId },
    });
    if (!answer) {
      throw HttpError(404, "Answer not found or does not belong to this audit");
    }
  }

  const uploadResult = await uploadToCloudinary(fileBuffer, {
    folder: `field-ops/audits/${auditId}`,
  });

  const thumbnailUrl = generateThumbnailUrl(uploadResult.public_id);

  const photo = await Photo.create({
    auditId,
    answerId,
    userId,
    cloudinaryPublicId: uploadResult.public_id,
    url: uploadResult.secure_url,
    thumbnailUrl,
    format: uploadResult.format,
    width: uploadResult.width,
    height: uploadResult.height,
    bytes: uploadResult.bytes,
    meta: {
      ...meta,
      cloudinaryData: {
        asset_id: uploadResult.asset_id,
        version: uploadResult.version,
      },
    },
  });

  return photo.get({ plain: true });
}

export async function deletePhoto(photoId, userId) {
  const photo = await Photo.findByPk(photoId, {
    include: [
      {
        model: Audit,
        as: "audit",
        attributes: ["id", "assigneeId", "companyId"],
      },
    ],
  });

  if (!photo) {
    throw HttpError(404, "Photo not found");
  }

  if (photo.userId !== userId && photo.audit.assigneeId !== userId) {
    throw HttpError(403, "Not authorized to delete this photo");
  }

  try {
    await cloudinary.uploader.destroy(photo.cloudinaryPublicId);
  } catch (error) {
    console.error("Failed to delete from Cloudinary:", error);
  }

  await photo.destroy();
}

export async function getAuditPhotos(auditId) {
  const photos = await Photo.findAll({
    where: { auditId },
    order: [["createdAt", "ASC"]],
    attributes: [
      "id",
      "url",
      "thumbnailUrl",
      "format",
      "width",
      "height",
      "bytes",
      "answerId",
      "createdAt",
    ],
  });

  return photos.map((p) => p.get({ plain: true }));
}

export async function getAnswerPhotos(answerId) {
  const photos = await Photo.findAll({
    where: { answerId },
    order: [["createdAt", "ASC"]],
    attributes: [
      "id",
      "url",
      "thumbnailUrl",
      "format",
      "width",
      "height",
      "bytes",
      "createdAt",
    ],
  });

  return photos.map((p) => p.get({ plain: true }));
}
