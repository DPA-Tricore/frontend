# Frontend Reminder System Implementation Guide

## Overview
The frontend reminder system is built as a modular, reusable component system that integrates with the existing NestJS backend API.

## Components Created

### 1. **NotificationBadge** (`components/notification-badge.tsx`)
- Displays a bell icon with a red badge showing pending reminder count
- Opens the NotificationCenter when clicked
- Automatically updates based on pending reminders
- Supports dark mode

**Usage:**
```tsx
import NotificationBadge from '@/components/notification-badge';

export default function Header() {
  return <NotificationBadge />;
}
```

### 2. **NotificationCenter** (`components/notification-center.tsx`)
- Full-screen drawer showing all reminders
- Filter tabs: All, Pending, Triggered
- Action buttons for each reminder: Acknowledge, Dismiss, Delete
- Displays reminder status with icons and color coding
- Shows overdue status with red highlighting

**Features:**
- Real-time reminder list
- Status-based filtering
- Quick actions (Acknowledge, Dismiss, Delete)
- Overdue detection with visual indicators

### 3. **ReminderModal** (`components/reminder-modal.tsx`)
- Modal form for creating new reminders
- Fields:
  - Title (required)
  - Description (optional)
  - Due Date & Time
  - Reminder Timing (predefined options: on-due-date, before-1-hour, before-1-day, before-3-days)
- Calculates reminder trigger time based on selections
- Supports linking to tasks and leads via optional props

**Usage:**
```tsx
import { useState } from 'react';
import ReminderModal from '@/components/reminder-modal';

export default function TaskDetail() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Create Reminder</button>
      <ReminderModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        taskId="task-id"
        initialData={{
          title: 'Task Title',
          description: 'Task Description',
          dueDate: new Date('2026-05-20'),
        }}
        onSuccess={(reminder) => console.log('Reminder created:', reminder)}
      />
    </>
  );
}
```

### 4. **ReminderWidget** (`components/reminder-widget.tsx`)
- Dashboard widget showing summary of reminders
- Statistics: Overdue, Upcoming, Acknowledged counts
- Limited list view (customizable limit)
- Time-relative display (in 2h, 3d, 5m overdue)
- "View All" button when exceeding limit

**Usage:**
```tsx
import ReminderWidget from '@/components/reminder-widget';

export default function Dashboard() {
  return (
    <ReminderWidget 
      limit={5}
      onViewAll={() => {/* navigate to full reminders list */}}
    />
  );
}
```

### 5. **Header** (`components/header.tsx`)
- Main navigation header with NotificationBadge integrated
- Theme toggle (light/dark mode)
- User info display
- Menu trigger for sidebar

**Usage:**
```tsx
<Header 
  title="Dashboard"
  onMenuClick={() => setSidebarOpen(!open)}
/>
```

### 6. **Reminders Management Page** (`app/dashboard/reminders/page.tsx`) ✨ NEW
Full-featured reminder management page accessible from the sidebar

**Features:**
- **Dashboard Stats**: Total, Pending, Triggered, Acknowledged counts
- **Advanced Filtering**:
  - Full-text search by title or description
  - Status filter (All, Pending, Triggered, Acknowledged, Dismissed, Cancelled)
  - Sort by: Reminder Time, Due Date, Title, Status, Created
  - Sort order: Ascending/Descending
- **Data Table**:
  - Title with description preview
  - Status badge with icon
  - Due date and reminder time
  - Relative time display (in 2h, 3d overdue)
  - Quick action buttons (Acknowledge, Dismiss, Delete)
  - Visual highlighting for overdue reminders
- **Pagination**: 10 items per page with prev/next navigation
- **Create Button**: Opens ReminderModal for new reminders

**URL:** `/dashboard/reminders`

**Usage:**
Navigate from sidebar or directly to the page. All reminders are displayed in a sortable, filterable table with full management capabilities.

## API Integration

### ReminderAPI (`lib/api/reminders.ts`)
Provides all API methods for reminder operations:

```typescript
// Create reminder
await reminderAPI.create({
  title: 'Follow up',
  description: 'Call client',
  dueDate: '2026-05-20T09:00:00Z',
  reminderTime: '2026-05-19T09:00:00Z',
  taskId: 'task-123'
});

// Get pending reminders
const reminders = await reminderAPI.getPending();

// Acknowledge reminder
await reminderAPI.acknowledge(reminderId);

// Dismiss reminder
await reminderAPI.dismiss(reminderId);

// Delete reminder
await reminderAPI.delete(reminderId);

// Get all with filters
const paginated = await reminderAPI.list({
  page: 1,
  limit: 20,
  status: 'PENDING',
  sortBy: 'reminderTime',
  sortOrder: 'asc'
});
```

## Custom Hook

### useReminders (`lib/hooks/use-reminders.ts`)
Manages reminder state and provides actions:

```typescript
const {
  reminders,           // Array of all reminders
  pendingCount,        // Count of PENDING reminders
  loading,            // Loading state
  error,              // Error message
  fetchPending,       // Refresh reminders
  createReminder,     // Create new reminder
  acknowledgeReminder,// Mark as acknowledged
  dismissReminder,    // Mark as dismissed
  deleteReminder,     // Delete reminder
} = useReminders();
```

**Options:**
```typescript
useReminders({
  autoRefresh: true,        // Auto-refresh reminders
  refreshInterval: 30000,   // Refresh every 30 seconds
});
```

## File Structure

```
frontend/
├── lib/
│   ├── api/
│   │   ├── reminders.ts          # API client
│   │   └── types/
│   │       └── reminder-types.ts  # TypeScript types
│   ├── hooks/
│   │   └── use-reminders.ts      # Custom hook
├── components/
│   ├── notification-badge.tsx     # Badge with bell icon
│   ├── notification-center.tsx    # Full reminder list drawer
│   ├── reminder-modal.tsx         # Create/edit modal
│   ├── reminder-widget.tsx        # Dashboard widget
│   └── header.tsx               # Top navigation header
└── app/
    ├── dashboard/
    │   ├── layout.tsx            # Dashboard layout (updated with Header)
    │   ├── reminders/
    │   │   └── page.tsx          # Full reminders management page ✨ NEW
    │   └── leads/
    │       └── dashboard/
    │           └── page.tsx      # Dashboard page (with ReminderWidget)
    └── (other pages)
```

## Integration Points

### 1. Dashboard Layout (`app/dashboard/layout.tsx`)
- Now includes `Header` component with NotificationBadge
- Header shows notification count in real-time

### 2. Dashboard Page (`app/dashboard/leads/dashboard/page.tsx`)
- Includes `ReminderWidget` in the sidebar area
- Shows top reminders with statistics

### 3. Sidebar (`components/sidebar.tsx`)
- Added "Reminders" navigation item (Bell icon)
- Links to `/dashboard/reminders`

### 4. Reminders Management Page (`app/dashboard/reminders/page.tsx`) ✨ NEW
- Full reminder management interface
- Accessible from sidebar or direct URL
- Integrated with dashboard layout

## State Management

The system uses:
- **React Hooks** for local component state
- **Custom Hook** (useReminders) for centralized reminder state
- **Auto-refresh** mechanism every 30 seconds
- **Real-time updates** when actions are performed

## Styling

All components use:
- **Tailwind CSS** for styling
- **Dark mode support** via context
- **Lucide icons** for consistent iconography
- **Responsive design** (mobile-first approach)

## Color Coding

- **Blue**: PENDING status, upcoming reminders
- **Orange**: TRIGGERED status (notification sent)
- **Green**: ACKNOWLEDGED status
- **Red**: OVERDUE status, errors
- **Gray**: DISMISSED status

## Next Steps (Future Enhancements)

1. **Snooze Functionality**: Add snooze options (1h, 1d, custom)
2. **Recurring Reminders**: Support for recurring patterns
3. **Sound Notifications**: Add audio alerts for triggered reminders
4. **Mobile Push**: Integrate with browser push notifications
5. **Email Notifications**: Send email reminders
6. **Task Integration**: Auto-create reminders when tasks are created
7. **Lead Reminders**: Standalone lead follow-up reminders
8. **Batch Operations**: Bulk acknowledge/dismiss reminders
9. **Reminder History**: Archive and search past reminders
10. **Customizable Timing**: Allow users to set custom reminder times

## Testing

Example test cases to cover:
- Reminder creation with various timing options
- Status transitions (PENDING → TRIGGERED → ACKNOWLEDGED)
- Real-time updates when reminders are triggered
- Overdue detection and highlighting
- Filter functionality in NotificationCenter
- Modal validation and error handling

## Performance Considerations

1. **Auto-refresh**: Set to 30 seconds to balance UX and server load
2. **Pagination**: List API supports pagination for large datasets
3. **Indexing**: Backend has indexes on userId, status, reminderTime
4. **Caching**: Consider caching pending reminders in localStorage

## Accessibility

- All buttons have proper ARIA labels
- Keyboard navigation supported
- Color not the only indicator (icons and text used)
- Proper heading hierarchy
- Focus management in modals

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)
