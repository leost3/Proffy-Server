import { Request, Response } from 'express'

import db from '../database/connection'
import convertHoutToMinutes from '../utils/convert-hours-to-minutes'

interface ScheduleItem {
  week_day: number,
  from: string,
  to: string
}


export default class ClassesController {
  async create(req: Request, res: Response) {
    const {
      name,
      avatar,
      whatsapp,
      bio,
      subject,
      cost, 
      schedule
    } = req.body
  
  
    const trx = await db.transaction();
  
  
    try {
      const insertedUsersIds = await trx('users').insert({
        name,
        avatar,
        whatsapp,
        bio
      })
    
      const user_id = insertedUsersIds[0]
    
      const insertedClassesIds = await trx('classes').insert({
        subject,
        cost,
        user_id
      })
    
      const class_id = insertedClassesIds[0]
    
      const classSechedule = schedule.map(({week_day, from, to}: ScheduleItem) => {
    
        return  {
          class_id,
          week_day,
          from: convertHoutToMinutes(from),
          to: convertHoutToMinutes(to)
        }
      })
    
      await trx('class_schedule').insert(classSechedule)
    
      await trx.commit()
    
      return res.status(201).send()
    }catch (err) {
      trx.rollback()
      console.log(err);
      
      return res.status(400).json({
        error: 'Unexpected error while creating new class'
      })
    }
    
  }
}