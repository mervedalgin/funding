import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Bir şeyler yanlış gitti
          </h2>
          <p className="text-gray-500 mb-6">
            Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.
          </p>
          <button
            onClick={this.handleRetry}
            className="bg-primary-500 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-primary-600 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
