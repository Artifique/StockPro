import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminSettingsPage } from "../admin-settings-page";
import { SystemService } from "@/services/system.service";

// Mock the SystemService
jest.mock("@/services/system.service", () => ({
  SystemService: {
    getSetting: jest.fn(),
    saveSetting: jest.fn(),
  },
}));

describe("AdminSettingsPage", () => {
  beforeEach(() => {
    // Reset mocks before each test
    (SystemService.getSetting as jest.Mock).mockClear();
    (SystemService.saveSetting as jest.Mock).mockClear();
  });

  it("affiche l'état de chargement initial", () => {
    (SystemService.getSetting as jest.Mock).mockReturnValueOnce(new Promise(() => {})); // Never resolve to keep loading state
    render(<AdminSettingsPage />);
    expect(screen.getByText(/Chargement des paramètres d'administration.../i)).toBeInTheDocument();
  });

  it("charge et affiche le nom de l'application", async () => {
    (SystemService.getSetting as jest.Mock).mockResolvedValueOnce("StockPro Admin");

    render(<AdminSettingsPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Nom de l'Application/i)).toHaveValue("StockPro Admin");
    });
  });

  it("permet à l'utilisateur de modifier et de sauvegarder le nom de l'application", async () => {
    (SystemService.getSetting as jest.Mock).mockResolvedValueOnce("Old App Name");
    (SystemService.saveSetting as jest.Mock).mockResolvedValueOnce(undefined);

    render(<AdminSettingsPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Nom de l'Application/i)).toHaveValue("Old App Name");
    });

    const appNameInput = screen.getByLabelText(/Nom de l'Application/i);
    await userEvent.clear(appNameInput);
    await userEvent.type(appNameInput, "New App Name");

    expect(appNameInput).toHaveValue("New App Name");

    const saveButton = screen.getByRole("button", {
      name: /Sauvegarder les paramètres/i,
    });
    await userEvent.click(saveButton);

    expect(saveButton).toHaveTextContent(/Sauvegarde.../i);

    await waitFor(() => {
      expect(SystemService.saveSetting).toHaveBeenCalledWith("application_name", "New App Name");
      expect(saveButton).toHaveTextContent(/Sauvegarder les paramètres/i);
    });
  });

  it("affiche un message d'erreur si le chargement des paramètres échoue", async () => {
    (SystemService.getSetting as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    render(<AdminSettingsPage />);

    await waitFor(() => {
      expect(screen.getByText(/Erreur: Network error/i)).toBeInTheDocument();
    });
  });

  it("affiche un message d'erreur si la sauvegarde des paramètres échoue", async () => {
    (SystemService.getSetting as jest.Mock).mockResolvedValueOnce("App Name");
    (SystemService.saveSetting as jest.Mock).mockRejectedValueOnce(new Error("Database write error"));

    render(<AdminSettingsPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Nom de l'Application/i)).toBeInTheDocument();
    });

    const appNameInput = screen.getByLabelText(/Nom de l'Application/i);
    await userEvent.type(appNameInput, "Changed App Name");

    const saveButton = screen.getByRole("button", {
      name: /Sauvegarder les paramètres/i,
    });
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Erreur: Database write error/i)).toBeInTheDocument();
    });
  });
});
