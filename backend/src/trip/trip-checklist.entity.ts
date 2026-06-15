import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { Trip } from './trip.entity'

@Entity('trip_checklist')
export class TripChecklist {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  tripId: string

  @ManyToOne(() => Trip, (t) => t.checklist)
  @JoinColumn({ name: 'tripId' })
  trip: Trip

  @Column()
  title: string

  @Column({ nullable: true })
  description: string

  @Column({ default: false })
  required: boolean

  @Column({ nullable: true })
  assignedUserId: string

  @Column('simple-array', { default: '' })
  checkedUserIds: string[]

  @Column({ default: 0 })
  sortOrder: number
}
