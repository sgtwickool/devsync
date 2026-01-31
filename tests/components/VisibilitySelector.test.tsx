import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { VisibilitySelector } from "@/components/snippets/visibility-selector"

describe("VisibilitySelector", () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders all visibility options", () => {
    render(
      <VisibilitySelector value="PRIVATE" onChange={mockOnChange} hasOrganization={true} />
    )

    expect(screen.getByText("Private")).toBeInTheDocument()
    expect(screen.getByText("Team")).toBeInTheDocument()
    expect(screen.getByText("Public")).toBeInTheDocument()
  })

  it("shows correct descriptions for each option", () => {
    render(
      <VisibilitySelector value="PRIVATE" onChange={mockOnChange} hasOrganization={true} />
    )

    expect(screen.getByText("Only you can see this snippet")).toBeInTheDocument()
    expect(screen.getByText("All organization members can see this")).toBeInTheDocument()
    expect(screen.getByText("Anyone with the link can see this")).toBeInTheDocument()
  })

  it("highlights the selected option", () => {
    const { rerender } = render(
      <VisibilitySelector value="PRIVATE" onChange={mockOnChange} hasOrganization={true} />
    )

    const privateButton = screen.getByRole("button", { name: /private/i })
    expect(privateButton).toHaveClass("border-primary")

    rerender(
      <VisibilitySelector value="PUBLIC" onChange={mockOnChange} hasOrganization={true} />
    )

    const publicButton = screen.getByRole("button", { name: /public/i })
    expect(publicButton).toHaveClass("border-primary")
  })

  it("calls onChange when clicking an option", async () => {
    const user = userEvent.setup()
    render(
      <VisibilitySelector value="PRIVATE" onChange={mockOnChange} hasOrganization={true} />
    )

    const publicButton = screen.getByRole("button", { name: /public/i })
    await user.click(publicButton)

    expect(mockOnChange).toHaveBeenCalledWith("PUBLIC")
  })

  it("disables Team option when hasOrganization is false", () => {
    render(
      <VisibilitySelector value="PRIVATE" onChange={mockOnChange} hasOrganization={false} />
    )

    const teamButton = screen.getByRole("button", { name: /team/i })
    expect(teamButton).toBeDisabled()
    expect(teamButton).toHaveClass("opacity-50")
  })

  it("enables Team option when hasOrganization is true", () => {
    render(
      <VisibilitySelector value="PRIVATE" onChange={mockOnChange} hasOrganization={true} />
    )

    const teamButton = screen.getByRole("button", { name: /team/i })
    expect(teamButton).not.toBeDisabled()
    expect(teamButton).not.toHaveClass("opacity-50")
  })

  it("shows different Team description based on hasOrganization", () => {
    const { rerender } = render(
      <VisibilitySelector value="PRIVATE" onChange={mockOnChange} hasOrganization={true} />
    )

    expect(screen.getByText("All organization members can see this")).toBeInTheDocument()

    rerender(
      <VisibilitySelector value="PRIVATE" onChange={mockOnChange} hasOrganization={false} />
    )

    expect(screen.getByText("Select an organization first")).toBeInTheDocument()
  })

  it("can select Team option when organization is selected", async () => {
    const user = userEvent.setup()
    render(
      <VisibilitySelector value="PRIVATE" onChange={mockOnChange} hasOrganization={true} />
    )

    const teamButton = screen.getByRole("button", { name: /team/i })
    await user.click(teamButton)

    expect(mockOnChange).toHaveBeenCalledWith("TEAM")
  })

  it("does not call onChange when clicking disabled Team option", async () => {
    const user = userEvent.setup()
    render(
      <VisibilitySelector value="PRIVATE" onChange={mockOnChange} hasOrganization={false} />
    )

    const teamButton = screen.getByRole("button", { name: /team/i })
    await user.click(teamButton)

    expect(mockOnChange).not.toHaveBeenCalled()
  })

  it("includes hidden input with current value", () => {
    render(
      <VisibilitySelector value="PUBLIC" onChange={mockOnChange} hasOrganization={true} />
    )

    const hiddenInput = document.querySelector('input[name="visibility"]')
    expect(hiddenInput).toHaveValue("PUBLIC")
  })
})
