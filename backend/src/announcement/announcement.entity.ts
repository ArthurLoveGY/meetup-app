import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('announcements')
export class Announcement {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  title: string

  @Column('text')
  content: string

  @Column({ default: 'info' })
  type: 'info' | 'update' | 'event' | 'maintenance'

  @Column({ default: 0 })
  priority: number

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date

  @Column({ default: true })
  active: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
