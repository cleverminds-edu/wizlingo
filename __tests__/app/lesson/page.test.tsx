import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter, useParams } from 'next/navigation'
import LessonPage from '@/app/lesson/[sessionId]/page'

// Mock Next.js routing
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn()
}))

// Mock auth
jest.mock('@/lib/auth', () => ({
  getTokenFromStorage: jest.fn(() => 'test_token')
}))

// Mock fetch
global.fetch = jest.fn()

describe('Lesson Player Component (T1.5)', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn()
  }

  const mockLessonData = {
    sessionId: 'session_789',
    lessonId: 'lesson_001',
    lesson: {
      id: 'lesson_001',
      title: 'Reading Comprehension: The Adventure',
      description: 'Learn about reading comprehension',
      estimatedMinutes: 15,
      contents: [
        {
          id: 'content_1',
          type: 'LESSON',
          sequence: 1,
          title: 'Introduction',
          content: {
            text: 'Welcome to this lesson about reading comprehension.'
          },
          mediaUrl: null
        },
        {
          id: 'content_2',
          type: 'EXERCISE',
          sequence: 2,
          title: 'Practice Reading',
          content: {
            passage: 'Once upon a time, in a small village, there lived a young girl named Sarah.',
            questions: [
              {
                id: 'q1',
                type: 'multiple_choice',
                question: 'What is the main character\'s name?',
                options: { a: 'John', b: 'Sarah', c: 'Michael', d: 'Emma' },
                correctAnswer: 'b',
                points: 1
              },
              {
                id: 'q2',
                type: 'true_false',
                question: 'The story takes place in a city.',
                correctAnswer: 'false',
                points: 1
              }
            ]
          },
          mediaUrl: null
        }
      ]
    },
    timing: {
      startedAt: '2026-06-30T10:00:00Z',
      expiresAt: '2026-06-30T10:30:00Z'
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useParams as jest.Mock).mockReturnValue({ sessionId: 'session_789' })
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockLessonData
    })
  })

  describe('Loading & Display', () => {
    it('should display loading state initially', () => {
      ;(global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      render(<LessonPage />)
      expect(screen.getByText('Loading lesson...')).toBeInTheDocument()
    })

    it('should display lesson title after loading', async () => {
      render(<LessonPage />)

      await waitFor(() => {
        expect(screen.getByText('Reading Comprehension: The Adventure')).toBeInTheDocument()
      })
    })

    it('should display current content', async () => {
      render(<LessonPage />)

      await waitFor(() => {
        expect(screen.getByText('Introduction')).toBeInTheDocument()
        expect(screen.getByText('Welcome to this lesson about reading comprehension.')).toBeInTheDocument()
      })
    })

    it('should show progress indicator', async () => {
      render(<LessonPage />)

      await waitFor(() => {
        expect(screen.getByText(/1 \/ 2/)).toBeInTheDocument()
      })
    })
  })

  describe('Navigation', () => {
    it('should disable Previous button on first content', async () => {
      render(<LessonPage />)

      await waitFor(() => {
        const prevButton = screen.getByRole('button', { name: /Previous/ })
        expect(prevButton).toBeDisabled()
      })
    })

    it('should show Next button on first content', async () => {
      render(<LessonPage />)

      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /Next/ })
        expect(nextButton).toBeEnabled()
      })
    })

    it('should navigate to next content when Next clicked', async () => {
      render(<LessonPage />)

      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /Next/ })
        fireEvent.click(nextButton)
      })

      await waitFor(() => {
        expect(screen.getByText('Practice Reading')).toBeInTheDocument()
      })
    })

    it('should navigate to previous content when Previous clicked', async () => {
      render(<LessonPage />)

      // Go to second content
      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /Next/ })
        fireEvent.click(nextButton)
      })

      // Go back to first content
      await waitFor(() => {
        const prevButton = screen.getByRole('button', { name: /Previous/ })
        fireEvent.click(prevButton)
      })

      await waitFor(() => {
        expect(screen.getByText('Introduction')).toBeInTheDocument()
      })
    })
  })

  describe('Question Rendering', () => {
    it('should render multiple choice questions', async () => {
      render(<LessonPage />)

      // Navigate to second content with questions
      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /Next/ })
        fireEvent.click(nextButton)
      })

      await waitFor(() => {
        expect(screen.getByText('What is the main character\'s name?')).toBeInTheDocument()
        expect(screen.getByLabelText('John')).toBeInTheDocument()
        expect(screen.getByLabelText('Sarah')).toBeInTheDocument()
        expect(screen.getByLabelText('Michael')).toBeInTheDocument()
        expect(screen.getByLabelText('Emma')).toBeInTheDocument()
      })
    })

    it('should render true/false questions', async () => {
      render(<LessonPage />)

      // Navigate to second content
      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /Next/ })
        fireEvent.click(nextButton)
      })

      await waitFor(() => {
        expect(screen.getByText('The story takes place in a city.')).toBeInTheDocument()
        expect(screen.getByLabelText('true')).toBeInTheDocument()
        expect(screen.getByLabelText('false')).toBeInTheDocument()
      })
    })

    it('should show passage before questions', async () => {
      render(<LessonPage />)

      // Navigate to second content
      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /Next/ })
        fireEvent.click(nextButton)
      })

      await waitFor(() => {
        expect(screen.getByText(/Once upon a time/)).toBeInTheDocument()
      })
    })
  })

  describe('Answer Tracking', () => {
    it('should track multiple choice answers', async () => {
      render(<LessonPage />)

      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /Next/ })
        fireEvent.click(nextButton)
      })

      await waitFor(() => {
        const sarahOption = screen.getByLabelText('Sarah')
        fireEvent.click(sarahOption)
        expect(sarahOption).toBeChecked()
      })
    })

    it('should track true/false answers', async () => {
      render(<LessonPage />)

      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /Next/ })
        fireEvent.click(nextButton)
      })

      await waitFor(() => {
        const falseOption = screen.getByLabelText('false')
        fireEvent.click(falseOption)
        expect(falseOption).toBeChecked()
      })
    })

    it('should allow changing answers', async () => {
      render(<LessonPage />)

      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /Next/ })
        fireEvent.click(nextButton)
      })

      await waitFor(() => {
        const johnOption = screen.getByLabelText('John')
        fireEvent.click(johnOption)
        expect(johnOption).toBeChecked()
      })

      const sarahOption = screen.getByLabelText('Sarah')
      fireEvent.click(sarahOption)
      expect(sarahOption).toBeChecked()
      expect(screen.getByLabelText('John')).not.toBeChecked()
    })
  })

  describe('Submit Button', () => {
    it('should show Submit button on last content', async () => {
      render(<LessonPage />)

      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /Next/ })
        fireEvent.click(nextButton)
      })

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Submit Answers/ })
        expect(submitButton).toBeInTheDocument()
      })
    })

    it('should disable Submit button if not all questions answered', async () => {
      render(<LessonPage />)

      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /Next/ })
        fireEvent.click(nextButton)
      })

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Submit Answers/ })
        expect(submitButton).toBeDisabled()
      })
    })

    it('should enable Submit button if all questions answered', async () => {
      render(<LessonPage />)

      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /Next/ })
        fireEvent.click(nextButton)
      })

      await waitFor(() => {
        const sarahOption = screen.getByLabelText('Sarah')
        fireEvent.click(sarahOption)
      })

      await waitFor(() => {
        const falseOption = screen.getByLabelText('false')
        fireEvent.click(falseOption)
      })

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Submit Answers/ })
        expect(submitButton).toBeEnabled()
      })
    })

    it('should submit answers when Submit clicked', async () => {
      const submitResponse = {
        ok: true,
        json: async () => ({ sessionId: 'session_789' })
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLessonData
      })

      ;(global.fetch as jest.Mock).mockResolvedValueOnce(submitResponse)

      render(<LessonPage />)

      // Navigate to questions
      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /Next/ })
        fireEvent.click(nextButton)
      })

      // Answer questions
      await waitFor(() => {
        const sarahOption = screen.getByLabelText('Sarah')
        fireEvent.click(sarahOption)
      })

      await waitFor(() => {
        const falseOption = screen.getByLabelText('false')
        fireEvent.click(falseOption)
      })

      // Submit
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Submit Answers/ })
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/lesson/session/session_789/submit',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              responses: {
                q1: 'b',
                q2: 'false'
              }
            })
          })
        )
      })

      // Should redirect to results
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/lesson/session_789/results')
      })
    })
  })

  describe('Error Handling', () => {
    it('should display error when lesson fails to load', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      render(<LessonPage />)

      await waitFor(() => {
        expect(screen.getByText(/Failed to load lesson/)).toBeInTheDocument()
      })
    })

    it('should display error when submit fails', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLessonData
      })

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Submit failed' })
      })

      render(<LessonPage />)

      // Navigate and answer
      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /Next/ })
        fireEvent.click(nextButton)
      })

      await waitFor(() => {
        const sarahOption = screen.getByLabelText('Sarah')
        fireEvent.click(sarahOption)
      })

      await waitFor(() => {
        const falseOption = screen.getByLabelText('false')
        fireEvent.click(falseOption)
      })

      // Try to submit
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Submit Answers/ })
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText(/Submit failed/)).toBeInTheDocument()
      })
    })

    it('should allow returning to dashboard on error', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      render(<LessonPage />)

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /Return to Dashboard/ })
        fireEvent.click(button)
      })

      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
    })
  })

  describe('Responsive Design', () => {
    it('should be mobile responsive', async () => {
      render(<LessonPage />)

      await waitFor(() => {
        const container = screen.getByText('Reading Comprehension: The Adventure')
          .closest('.max-w-4xl')
        expect(container).toHaveClass('px-4')
      })
    })
  })

  describe('Authentication', () => {
    it('should redirect to login if no token', async () => {
      const { getTokenFromStorage } = require('@/lib/auth')
      getTokenFromStorage.mockReturnValue(null)

      render(<LessonPage />)

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/login')
      })
    })
  })
})
