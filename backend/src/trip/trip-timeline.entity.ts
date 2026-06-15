import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { Trip } from './trip.entity'

@Entity('trip_timeline')
export class TripTimeline {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  tripId: string

  @ManyToOne(() => Trip, (t) => t.timeline)
  @JoinColumn({ name: 'tripId' })
  trip: Trip

  @Column({ nullable: true })
  time: string

  @Column()
  title: string

  @Column({ nullable: true })
  description: string

  @Column({ nullable: true })
  locationName: string

  @Column({ default: 0 })
  sortOrder: number
}
