import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import contentRouter from "./content";
import snapshotRouter from "./snapshot";
import futureRouter from "./future";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(contentRouter);
router.use(snapshotRouter);
router.use(futureRouter);
router.use(storageRouter);

export default router;
