import { Router, type IRouter } from "express";
import healthRouter from "./health";
import propertiesRouter from "./properties";
import favoritesRouter from "./favorites";
import viewingsRouter from "./viewings";
import kycRouter from "./kyc";
import testimonialsRouter from "./testimonials";
import locationsRouter from "./locations";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(propertiesRouter);
router.use(favoritesRouter);
router.use(viewingsRouter);
router.use(kycRouter);
router.use(testimonialsRouter);
router.use(locationsRouter);
router.use(dashboardRouter);

export default router;
