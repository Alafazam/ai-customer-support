# AI Customer Support Platform

A modern customer support platform that leverages AI to streamline ticket management and improve customer service efficiency.

## Project Overview

This platform provides an automated ticket management system with intelligent issue classification, proactive customer interaction, and streamlined support agent workflows. It integrates with Freshdesk for ticket management and provides interfaces for both customers and support agents.

## Project Structure

```
ai-customer-support/
├── src/
│   ├── app/                 # Next.js app router pages and layouts
│   ├── components/         # React components
│   │   ├── ui/            # Reusable UI components
│   │   └── ChatBot/       # Chat interface components
│   ├── lib/               # Utility functions and shared logic
│   └── types/             # TypeScript type definitions
├── public/                # Static assets
└── ...config files
```

### Key Directories

- `src/app`: Contains the application's pages and layouts using Next.js 14's app router
- `src/components/ui`: Houses reusable UI components built with Radix UI and styled with Tailwind CSS
- `src/components/ChatBot`: Contains the chat interface implementation
- `src/lib`: Utility functions, API clients, and shared business logic
- `src/types`: TypeScript type definitions for the application

## Coding Guidelines

### 1. Component Structure

```typescript
// Component naming: PascalCase
// File naming: ComponentName.tsx
const ComponentName: React.FC<Props> = () => {
  // 1. Hooks
  const [state, setState] = useState();
  
  // 2. Refs
  const elementRef = useRef();
  
  // 3. Derived state
  const derivedValue = useMemo(() => {}, []);
  
  // 4. Effects
  useEffect(() => {}, []);
  
  // 5. Event handlers
  const handleEvent = () => {};
  
  // 6. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};
```

### 2. TypeScript Usage

- Always define proper types for props and state
- Use interfaces for objects that represent a "thing"
- Use type for unions, intersections, and utility types
- Avoid using `any` - use `unknown` if type is truly unknown

```typescript
interface Props {
  data: DataType;
  onAction: (id: string) => void;
}

type Status = 'idle' | 'loading' | 'success' | 'error';
```

### 3. State Management

- Use React's useState for component-level state
- Use React Context for shared state when needed
- Keep state as close as possible to where it's used
- Use reducers for complex state logic

### 4. Styling

- Use Tailwind CSS for styling
- Follow mobile-first approach
- Use CSS variables for theme values
- Maintain consistent spacing and sizing

### 5. Error Handling

- Implement proper error boundaries
- Use try-catch blocks for async operations
- Provide meaningful error messages to users
- Log errors appropriately for debugging

### 6. Performance

- Use React.memo() for expensive components
- Implement proper dependency arrays in hooks
- Use pagination for large lists
- Optimize images and assets

### 7. Testing

- Write unit tests for utility functions
- Write integration tests for complex components
- Use React Testing Library for component tests
- Maintain good test coverage

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/yourusername/ai-customer-support.git
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
FRESHDESK_API_KEY=your_api_key
FRESHDESK_DOMAIN=your_domain
```

## Contributing

1. Create a feature branch from `main`
2. Follow the coding guidelines
3. Write clear commit messages
4. Submit a pull request with a description of changes
