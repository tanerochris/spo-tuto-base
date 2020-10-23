import { applySession } from 'next-session';
import { sessionOptions } from '../middlewares/Session';

export const getSession = async (req, res) => {
    await applySession(req, res, sessionOptions);
    return JSON.stringify(req.session || {});
};
