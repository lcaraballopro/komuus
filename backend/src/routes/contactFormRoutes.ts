import express from "express";
import isAuth from "../middleware/isAuth";

import * as ContactFormController from "../controllers/ContactFormController";

const contactFormRoutes = express.Router();

// Contact Forms CRUD
contactFormRoutes.get("/contact-forms", isAuth, ContactFormController.index);
contactFormRoutes.post("/contact-forms", isAuth, ContactFormController.store);
contactFormRoutes.get("/contact-forms/:formId", isAuth, ContactFormController.show);
contactFormRoutes.put("/contact-forms/:formId", isAuth, ContactFormController.update);
contactFormRoutes.delete("/contact-forms/:formId", isAuth, ContactFormController.remove);

// Contact Form Responses
contactFormRoutes.post("/contact-forms/:formId/responses", isAuth, ContactFormController.submitResponse);
contactFormRoutes.get("/contact-forms/:formId/responses", isAuth, ContactFormController.listResponses);

export default contactFormRoutes;
