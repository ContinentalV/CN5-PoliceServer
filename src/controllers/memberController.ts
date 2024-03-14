// controllers/memberController.ts
import express, {NextFunction, Request, Response} from 'express';
import memberService from '../services/memberService';
import {logInfo} from "../utils/functions";
import {ConflictError, CriticalError, LightError} from "../utils/CustomError";
import {IUser} from "../entities/Member";
//TODO joi ou express validator pour typer req.body
//Todo ajouter des interface pour req.body
const router = express.Router();


router.get('/members/:discordId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const member = await memberService.getMemberById(req.params.discordId);
        if (member) {
            res.json(member);
        } else {
            throw new LightError("Membre non trouvé.")
        }
    } catch (error: unknown) {
        next(error)
    }
});


router.post('/members', async (req: Request, res: Response, next: NextFunction) => {
    try {

        await memberService.createMember(req.body); // Assurez-vous que req.body a la structure attendue
        await memberService.createServiceEntryForMember(req.body.discordId)
        await memberService.roleMember(req.body)
        await memberService.createGradeEntryForMember(req.body.discordId, req.body.initRole)
        res.status(201).send('Profile en bdd creer avec succès.');
    } catch (error: unknown) {
        next(error instanceof Error ? error : new CriticalError("Erreur inconnue lors de la creation du profil"));
    }
});
router.post("/init", async (req: Request, res: Response, next: NextFunction) => {
    const usersData = req.body as any[]; // Remplacez 'any' par un type plus spécifique si possible
    //console.log(usersData)
    const usersNotAdded: any[] = []; // Remplacez 'any' par un type plus spécifique si possible

    try {
        for (const userData of usersData) {
            const existingMember = await memberService.getMemberById(userData.discordId);
            if (!existingMember) {
                await memberService.createMember(userData);
                await memberService.roleMember(userData)
                await memberService.gradeMember(userData)
                await memberService.createServiceEntryForMember(userData.discordId)
            } else {
                usersNotAdded.push({
                    discordId: userData.discordId,
                    username: userData.username,
                    codeMetier: userData.codeMetier,
                    matricule: userData.matricule
                });
            }
        }
        res.status(200).json({
            message: 'Initialisation terminée.',
            usersNotAdded: usersNotAdded
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            next(error instanceof Error ? error : new CriticalError("Erreur inconnue lors de l'initialisation"));
        }
    }
});
router.put("/matriculeUpdate", async (req: Request, res: Response, next: NextFunction) => {

    try {
        const newMat = req.body.newMat as number
        const target = req.body.target

        const dbTarget: IUser | null = await memberService.getMemberById(target)


        if (!dbTarget || typeof dbTarget.codeMetier !== "string") throw new LightError("Cette agent n'est pas présent dans la bdd.")
        await memberService.updateMemberMatricule(dbTarget.discordId, newMat, dbTarget.codeMetier)
        res.status(200).json({message: `Mise a jour du matricule ${dbTarget.matricule} par => ${newMat}: ✅`})
        logInfo({message: `Mise a jour du matricule ${dbTarget.matricule} par => ${newMat}: ✅`})

    } catch (error) {
        next(error instanceof Error ? error : new ConflictError("Ce matricule est deja pris"));
    }


})
router.put("/rolesUpdate", async (req: Request, res: Response, next: NextFunction) => {
    interface UserUpdates {
        avatar?: string;
        nomRP?: string;
    }

    const {id: target, avatar, nickname, role} = req.body;
    console.log(role)

    try {
        const userDB: IUser | null = await memberService.getMemberById(target)
        if (!userDB) return res.status(404).json({message: "Utilisateur introuvable."})
        const updates: UserUpdates = {}
        if (avatar && userDB.avatar !== avatar) {
            updates.avatar = avatar
        }
        if (nickname !== undefined && userDB?.nomRP !== nickname) {
            updates.nomRP = nickname;
        }

        if (role !== undefined) {

            await memberService.updateMemberRole(target, role);
        }

        if (Object.keys(updates).length > 0) {
            await memberService.updateMemberInfo(target, updates)
        }
        res.status(200).json({message: "data updates"})

    } catch (e) {
        next(e)
    }


})
router.delete('/leave/:discordId', async (req: Request, res: Response, next: NextFunction) => {
    const target: string = req.params.discordId
    try {
        await memberService.deleteMember(target)
        logInfo({message: `AGENT: ${target} => agent supprimer`})
        res.status(200).json({message: `Suppression des data de l'agent: <@${target}> réussi`})
    } catch (e) {
        next(e instanceof Error ? e : new ConflictError("Erreur interne BDD"));

    }


})
export default router;
