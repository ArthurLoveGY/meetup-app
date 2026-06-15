import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Trip } from '../trip/trip.entity'

@Entity('budget_items')
export class BudgetItem {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  tripId: string

  @ManyToOne(() => Trip)
  @JoinColumn({ name: 'tripId' })
  trip: Trip

  @Column()
  category: string

  @Column()
  description: string

  @Column({ type: 'float' })
  amount: number

  @Column({ nullable: true })
  paidBy: string

  @Column('simple-array', { default: '' })
  splitAmong: string[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
