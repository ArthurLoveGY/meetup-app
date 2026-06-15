import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm'
import { Trip } from '../trip/trip.entity'
import { User } from '../user/user.entity'
import { VoteOption } from './vote-option.entity'

@Entity('votes')
export class Vote {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  tripId: string

  @ManyToOne(() => Trip)
  @JoinColumn({ name: 'tripId' })
  trip: Trip

  @Column()
  title: string

  @Column({ default: 'custom' })
  type: 'date' | 'location' | 'restaurant' | 'budget' | 'custom'

  @Column({ nullable: true })
  description: string

  @Column()
  createdById: string

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User

  @Column({ nullable: true, type: 'timestamp' })
  deadline: Date

  @Column({ default: true })
  isActive: boolean

  @OneToMany(() => VoteOption, (o) => o.vote)
  options: VoteOption[]

  @CreateDateColumn()
  createdAt: Date
}
