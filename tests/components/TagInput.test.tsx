import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { TagInput } from "@/components/snippets/tag-input"

// Mock fetch for API calls
global.fetch = vi.fn()

describe("TagInput", () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    })
  })

  it("renders with placeholder when no tags", () => {
    render(<TagInput tags={[]} onChange={mockOnChange} placeholder="Add tags..." />)

    expect(screen.getByPlaceholderText("Add tags...")).toBeInTheDocument()
  })

  it("displays existing tags", () => {
    render(<TagInput tags={["react", "typescript"]} onChange={mockOnChange} />)

    expect(screen.getByText("react")).toBeInTheDocument()
    expect(screen.getByText("typescript")).toBeInTheDocument()
  })

  it("adds a tag when pressing Enter", async () => {
    const user = userEvent.setup()
    render(<TagInput tags={[]} onChange={mockOnChange} />)

    const input = screen.getByRole("textbox")
    await user.type(input, "javascript{Enter}")

    expect(mockOnChange).toHaveBeenCalledWith(["javascript"])
  })

  it("adds a tag when pressing comma", async () => {
    const user = userEvent.setup()
    render(<TagInput tags={[]} onChange={mockOnChange} />)

    const input = screen.getByRole("textbox")
    await user.type(input, "javascript,")

    expect(mockOnChange).toHaveBeenCalledWith(["javascript"])
  })

  it("normalizes tags by removing # and lowercasing", async () => {
    const user = userEvent.setup()
    render(<TagInput tags={[]} onChange={mockOnChange} />)

    const input = screen.getByRole("textbox")
    await user.type(input, "#TypeScript{Enter}")

    expect(mockOnChange).toHaveBeenCalledWith(["typescript"])
  })

  it("removes a tag when clicking the remove button", async () => {
    const user = userEvent.setup()
    render(<TagInput tags={["react", "typescript"]} onChange={mockOnChange} />)

    const removeButtons = screen.getAllByRole("button", { name: /remove tag/i })
    await user.click(removeButtons[0])

    expect(mockOnChange).toHaveBeenCalledWith(["typescript"])
  })

  it("removes the last tag when pressing Backspace with empty input", async () => {
    const user = userEvent.setup()
    render(<TagInput tags={["react", "typescript"]} onChange={mockOnChange} />)

    const input = screen.getByRole("textbox")
    await user.click(input)
    await user.keyboard("{Backspace}")

    expect(mockOnChange).toHaveBeenCalledWith(["react"])
  })

  it("does not add duplicate tags", async () => {
    const user = userEvent.setup()
    render(<TagInput tags={["react"]} onChange={mockOnChange} />)

    const input = screen.getByRole("textbox")
    await user.type(input, "react{Enter}")

    // onChange should not be called since it's a duplicate
    expect(mockOnChange).not.toHaveBeenCalled()
  })

  it("respects maxTags limit", async () => {
    const user = userEvent.setup()
    render(<TagInput tags={["tag1", "tag2"]} onChange={mockOnChange} maxTags={2} />)

    const input = screen.queryByRole("textbox")
    // Input should not be visible when max tags reached
    expect(input).not.toBeInTheDocument()
  })

  it("displays tag count", () => {
    render(<TagInput tags={["react", "typescript"]} onChange={mockOnChange} maxTags={10} />)

    expect(screen.getByText(/2\/10 tags/)).toBeInTheDocument()
  })

  it("handles pasting multiple tags", async () => {
    const user = userEvent.setup()
    render(<TagInput tags={[]} onChange={mockOnChange} />)

    const input = screen.getByRole("textbox")
    await user.click(input)

    // Simulate paste
    const clipboardData = {
      getData: () => "react, typescript, nextjs",
    }
    fireEvent.paste(input, { clipboardData })

    expect(mockOnChange).toHaveBeenCalledWith(["react", "typescript", "nextjs"])
  })

  it("trims whitespace from tags", async () => {
    const user = userEvent.setup()
    render(<TagInput tags={[]} onChange={mockOnChange} />)

    const input = screen.getByRole("textbox")
    await user.type(input, "  react  {Enter}")

    expect(mockOnChange).toHaveBeenCalledWith(["react"])
  })

  it("does not add empty tags", async () => {
    const user = userEvent.setup()
    render(<TagInput tags={[]} onChange={mockOnChange} />)

    const input = screen.getByRole("textbox")
    await user.type(input, "   {Enter}")

    expect(mockOnChange).not.toHaveBeenCalled()
  })
})
