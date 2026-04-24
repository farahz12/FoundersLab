import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { EventsComponent } from './events.component';
import { AuthService } from '../../core/services/auth.service';
import { EventService } from '../../services/event.service';
import { RegistrationService } from '../../services/registration.service';
import { TicketService } from '../../services/ticket.service';
import { SpeakerService } from '../../services/speaker.service';
import { ProgramService } from '../../services/program.service';
import { PredictionService } from '../../services/prediction.service';
import { Event, EventStatus } from '../../models/event';

function makeEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: 1,
    title: 'Test Event',
    description: '',
    type: 'WORKSHOP',
    status: 'PUBLIE',
    locationType: 'PRESENTIEL',
    startDate: '2026-04-18T10:00:00',
    endDate: '2026-04-18T12:00:00',
    capacityMax: 100,
    registeredCount: 40,
    targetSector: [],
    targetStage: [],
    latitude: 36.8,
    longitude: 10.2,
    ...overrides,
  } as Event;
}

const mockAuthService = {
  hasRole: jasmine.createSpy('hasRole').and.returnValue(false),
  getCurrentUser: () => null,
};

const mockEventService = {
  getAll: jasmine.createSpy('getAll').and.returnValue(of([])),
  getById: jasmine.createSpy('getById').and.returnValue(of(makeEvent())),
  getPending: jasmine.createSpy('getPending').and.returnValue(of([])),
};

const mockRegistrationService = {
  getMyRegistrations: jasmine.createSpy('getMyRegistrations').and.returnValue(of([])),
  getByEvent: jasmine.createSpy('getByEvent').and.returnValue(of([])),
};

const mockTicketService = {
  getMyTicket: jasmine.createSpy('getMyTicket').and.returnValue(of(null)),
};

const mockSpeakerService = {
  getAll: jasmine.createSpy('getAll').and.returnValue(of([])),
  getByEvent: jasmine.createSpy('getByEvent').and.returnValue(of([])),
};

const mockProgramService = {
  getByEvent: jasmine.createSpy('getByEvent').and.returnValue(of([])),
};

const mockPredictionService = {
  analyzeEvent: jasmine.createSpy('analyzeEvent').and.returnValue(null),
  buildPayload: jasmine.createSpy('buildPayload').and.returnValue(null),
};

describe('EventsComponent', () => {
  let component: EventsComponent;
  let fixture: ComponentFixture<EventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EventsComponent],
      imports: [ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: EventService, useValue: mockEventService },
        { provide: RegistrationService, useValue: mockRegistrationService },
        { provide: TicketService, useValue: mockTicketService },
        { provide: SpeakerService, useValue: mockSpeakerService },
        { provide: ProgramService, useValue: mockProgramService },
        { provide: PredictionService, useValue: mockPredictionService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(EventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    mockAuthService.hasRole.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialise with directory workspace tab', () => {
    expect((component as any).workspaceTab).toBe('directory');
  });

  it('should initialise with grid view mode', () => {
    expect((component as any).viewMode).toBe('grid');
  });

  describe('canCreate()', () => {
    it('returns true for ADMIN', () => {
      mockAuthService.hasRole.and.returnValue(true);
      expect((component as any).canCreate()).toBeTrue();
    });

    it('returns false for regular user', () => {
      mockAuthService.hasRole.and.returnValue(false);
      expect((component as any).canCreate()).toBeFalse();
    });
  });

  describe('isAdmin()', () => {
    it('delegates to authService.hasRole with ADMIN', () => {
      mockAuthService.hasRole.and.returnValue(true);
      expect((component as any).isAdmin()).toBeTrue();
      expect(mockAuthService.hasRole).toHaveBeenCalledWith('ADMIN');
    });
  });

  describe('filteredEvents', () => {
    beforeEach(() => {
      (component as any).events = [
        makeEvent({ id: 1, title: 'Angular Workshop', type: 'WORKSHOP', status: 'PUBLIE' }),
        makeEvent({ id: 2, title: 'Startup Pitch', type: 'PITCH', status: 'BROUILLON' }),
        makeEvent({ id: 3, title: 'React Conference', type: 'CONFERENCE', status: 'PUBLIE' }),
      ];
    });

    it('returns all events when no filters are active', () => {
      expect((component as any).filteredEvents.length).toBe(3);
    });

    it('filters by search query (case-insensitive)', () => {
      (component as any).searchQuery = 'angular';
      expect((component as any).filteredEvents.length).toBe(1);
      expect((component as any).filteredEvents[0].title).toBe('Angular Workshop');
    });

    it('filters by event type', () => {
      (component as any).selectedTypeFilter = 'PITCH';
      expect((component as any).filteredEvents.length).toBe(1);
      expect((component as any).filteredEvents[0].type).toBe('PITCH');
    });

    it('filters by status', () => {
      (component as any).selectedStatusFilter = 'PUBLIE';
      expect((component as any).filteredEvents.length).toBe(2);
    });
  });

  describe('calendar navigation', () => {
    beforeEach(() => {
      (component as any).calendarYear = 2026;
      (component as any).calendarMonth = 0;
    });

    it('prevCalendarMonth() goes to December of previous year from January', () => {
      (component as any).prevCalendarMonth();
      expect((component as any).calendarMonth).toBe(11);
      expect((component as any).calendarYear).toBe(2025);
    });

    it('prevCalendarMonth() decrements month normally', () => {
      (component as any).calendarMonth = 5;
      (component as any).prevCalendarMonth();
      expect((component as any).calendarMonth).toBe(4);
      expect((component as any).calendarYear).toBe(2026);
    });

    it('nextCalendarMonth() goes to January of next year from December', () => {
      (component as any).calendarMonth = 11;
      (component as any).nextCalendarMonth();
      expect((component as any).calendarMonth).toBe(0);
      expect((component as any).calendarYear).toBe(2027);
    });

    it('nextCalendarMonth() increments month normally', () => {
      (component as any).calendarMonth = 3;
      (component as any).nextCalendarMonth();
      expect((component as any).calendarMonth).toBe(4);
    });

    it('goToCalendarToday() resets to current month/year', () => {
      const now = new Date();
      (component as any).calendarYear = 2020;
      (component as any).calendarMonth = 0;
      (component as any).goToCalendarToday();
      expect((component as any).calendarYear).toBe(now.getFullYear());
      expect((component as any).calendarMonth).toBe(now.getMonth());
    });
  });

  describe('calendarDays', () => {
    it('grid length is always a multiple of 7', () => {
      (component as any).calendarYear = 2026;
      (component as any).calendarMonth = 3;
      const cells = (component as any).calendarDays;
      expect(cells.length % 7).toBe(0);
    });

    it('null-date cells pad the start of the week correctly', () => {
      (component as any).calendarYear = 2026;
      (component as any).calendarMonth = 3;
      const cells = (component as any).calendarDays;
      expect(cells[0].date).toBeNull();
      expect(cells[1].date).toBeNull();
      expect(cells[2].date).not.toBeNull();
    });

    it('marks today correctly', () => {
      const now = new Date();
      (component as any).calendarYear = now.getFullYear();
      (component as any).calendarMonth = now.getMonth();
      const cells = (component as any).calendarDays;
      const todayCell = cells.find((c: any) => c.isToday);
      expect(todayCell).toBeDefined();
      expect(todayCell.date?.getDate()).toBe(now.getDate());
    });
  });

  describe('calendarMonthLabel', () => {
    it('returns formatted label for April 2026', () => {
      (component as any).calendarYear = 2026;
      (component as any).calendarMonth = 3;
      expect((component as any).calendarMonthLabel).toContain('April');
      expect((component as any).calendarMonthLabel).toContain('2026');
    });
  });

  describe('fillRate()', () => {
    it('returns 0 when capacityMax is falsy', () => {
      const event = makeEvent({ capacityMax: 0, registeredCount: 10 });
      expect((component as any).fillRate(event)).toBe(0);
    });

    it('calculates correct percentage', () => {
      const event = makeEvent({ capacityMax: 100, registeredCount: 25 });
      expect((component as any).fillRate(event)).toBe(25);
    });

    it('rounds to nearest integer', () => {
      const event = makeEvent({ capacityMax: 3, registeredCount: 1 });
      expect((component as any).fillRate(event)).toBe(33);
    });
  });

  describe('formatDateTime()', () => {
    it('returns — for null', () => {
      expect((component as any).formatDateTime(null)).toBe('—');
    });

    it('returns a non-empty string for a valid ISO date', () => {
      const result = (component as any).formatDateTime('2026-04-18T10:00:00');
      expect(result.length).toBeGreaterThan(0);
      expect(result).not.toBe('—');
    });
  });

  describe('typeBg()', () => {
    it('returns a CSS var for known types', () => {
      expect((component as any).typeBg('PITCH')).toContain('var(');
      expect((component as any).typeBg('WORKSHOP')).toContain('var(');
    });

    it('returns neutral bg for unknown type', () => {
      expect((component as any).typeBg('UNKNOWN')).toBe('var(--badge-neutral-bg)');
    });
  });

  describe('statusTone()', () => {
    it('returns green bg for PUBLIE', () => {
      const tone = (component as any).statusTone('PUBLIE' as EventStatus);
      expect(tone.bg).toContain('green');
    });

    it('returns amber bg for EN_ATTENTE_VALIDATION', () => {
      const tone = (component as any).statusTone('EN_ATTENTE_VALIDATION' as EventStatus);
      expect(tone.bg).toContain('amber');
    });

    it('returns red bg for REJETE', () => {
      const tone = (component as any).statusTone('REJETE' as EventStatus);
      expect(tone.bg).toContain('red');
    });
  });

  describe('defaultCover()', () => {
    it('returns a picsum URL seeded with event id', () => {
      const event = makeEvent({ id: 42 });
      expect((component as any).defaultCover(event)).toContain('event-42');
    });
  });

  describe('eventMarkersForMap', () => {
    it('excludes DISTANCIEL events', () => {
      (component as any).events = [
        makeEvent({ id: 1, locationType: 'DISTANCIEL', latitude: 36.8, longitude: 10.2 }),
        makeEvent({ id: 2, locationType: 'PRESENTIEL', latitude: 36.8, longitude: 10.2 }),
      ];
      const markers = (component as any).eventMarkersForMap;
      expect(markers.length).toBe(1);
      expect(markers[0].id).toBe(2);
    });

    it('excludes events with no coordinates', () => {
      (component as any).events = [
        makeEvent({ id: 1, locationType: 'PRESENTIEL', latitude: null as any, longitude: null as any }),
        makeEvent({ id: 2, locationType: 'PRESENTIEL', latitude: 36.8, longitude: 10.2 }),
      ];
      expect((component as any).eventMarkersForMap.length).toBe(1);
    });
  });

  describe('openEventForm()', () => {
    it('sets showEventForm to true', () => {
      (component as any).showEventForm = false;
      (component as any).openEventForm();
      expect((component as any).showEventForm).toBeTrue();
    });

    it('sets editingEvent when an event is provided', () => {
      const event = makeEvent({ id: 99 });
      (component as any).openEventForm(event);
      expect((component as any).editingEvent).toBe(event);
    });

    it('clears editingEvent when no event is provided', () => {
      (component as any).editingEvent = makeEvent();
      (component as any).openEventForm();
      expect((component as any).editingEvent).toBeNull();
    });
  });
});