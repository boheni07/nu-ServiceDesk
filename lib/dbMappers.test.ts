import { describe, it, expect } from 'vitest';
import { mapTicket, mapTicketToDB, mapCompany, mapCompanyToDB } from './dbMappers';
import { Ticket, TicketStatus, Company, CompanyStatus } from '../types';

describe('dbMappers', () => {
    describe('mapTicket', () => {
        it('should correctly map snake_case DB data to camelCase Ticket object', () => {
            const dbData = {
                id: '123',
                title: 'Test Ticket',
                customer_id: 'user1',
                created_at: '2023-01-01',
                due_date: '2023-01-10',
                status: 'RECEIVED' // TicketStatus.RECEIVED mapped to DB value
            };

            const result = mapTicket(dbData);

            expect(result).toMatchObject({
                id: '123',
                title: 'Test Ticket',
                customerId: 'user1',
                createdAt: '2023-01-01',
                dueDate: '2023-01-10',
                status: TicketStatus.RECEIVED
            });
        });
    });

    describe('mapTicketToDB', () => {
        it('should correctly map Ticket object to snake_case DB data', () => {
            const ticket: Ticket = {
                id: '123',
                title: 'Test Ticket',
                description: 'Desc',
                status: TicketStatus.RECEIVED,
                customerId: 'user1',
                customerName: 'User One',
                projectId: 'p1',
                createdAt: '2023-01-01',
                dueDate: '2023-01-10',
                attachments: [],
                planAttachments: [],
                // Optional fields
            } as Ticket;

            const result = mapTicketToDB(ticket);

            expect(result).toMatchObject({
                id: '123',
                title: 'Test Ticket',
                customer_id: 'user1',
                due_date: '2023-01-10',
                status: 'RECEIVED'
            });
        });
    });
    describe('mapCompany', () => {
        it('should correctly map DB data to Company object with Enum conversion', () => {
            const dbData = {
                id: 'c1',
                name: 'Test Co',
                status: 'ACTIVE'
            };
            const result = mapCompany(dbData);
            expect(result.status).toBe(CompanyStatus.ACTIVE); // Should be '활성'
        });
    });

    describe('mapCompanyToDB', () => {
        it('should correctly map Company object to DB data with Enum conversion', () => {
            const company: Company = {
                id: 'c1',
                name: 'Test Co',
                status: CompanyStatus.ACTIVE
            } as Company;

            const result = mapCompanyToDB(company);
            expect(result.status).toBe('ACTIVE');
        });
    });
});

