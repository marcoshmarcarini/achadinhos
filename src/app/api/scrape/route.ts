import {NextResponse} from 'next/server'
import {scrapeShopee} from '../../../../lib/shopeeScraper'
import {db} from '../../../../lib/firebase'



export const dynamic = 'force-dynamic'

export async function GET(){
    try{
        const offers = await scrapeShopee('oferta relâmpago', 30)
        const batch = db().batch()

        offers.forEach((o) => {
            const ref = db().collection('offers').doc()
            batch.set(ref, {...o, createdAt: new Date()})
        })

        await batch.commit()
        return NextResponse.json({saved: offers.length})
    }catch(err: Error | unknown){
        console.error(err)
        return NextResponse.json({error: err.message}, {status:500})
    }
}