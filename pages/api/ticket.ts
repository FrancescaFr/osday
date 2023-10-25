import { NextApiRequest, NextApiResponse } from "next";
import ticket from '../../public/ticket.svg';
import fs from 'fs';
import path from 'path'





export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
  ) {

    const {
        eid = 0,
        oid = 0,
        tid = null
    } = req.query;

    if (tid) {
        const { name } = JSON.parse(Buffer.from(tid.toString(), 'hex').toString("utf8"));
        const filePath = path.resolve('./public/ticket.svg');
        const imageBuffer = fs.readFileSync(filePath);
        res.setHeader('Content-Type', 'image/svg+xml');
        const finalString = Buffer.from(imageBuffer).toString('utf8').replace('ATTENDEE_NAME', name);
        res.send(Buffer.from(finalString));
        return;
    }

    if (!eid && !oid) {
        res.redirect('/404');
    }

    try {
        const data = await fetch(`https://www.eventbriteapi.com/v3/orders/${oid}/`, {
            headers: {
                "Authorization": "Bearer " + process.env.EVENTBRITE_AUTH_TOKEN
            }
        }).then((response) => response.json())
        
        if (data.name && data.id) {
            const ticketData = {
                name: data.name,
                oid: data.id,
            };

            const tid = Buffer.from(JSON.stringify(ticketData)).toString('hex');
            res.redirect(`/ticket?tid=${tid}`);
        }
    } catch (e) {
        console.log(e);
        res.redirect('/');
    }
}