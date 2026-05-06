import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ParametresUtilisateurPage } from "../parametres-utilisateur-page";
import { supabase } from "@/lib/supabase/client"; // Import the actual supabase client
import { Profile } from "@/models/system.model";

// Mock the Supabase client
jest.mock("@/lib/supabase/client", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: null,
            error: { code: "PGRST116", message: "No rows found" },
          })),
        })),
      })),
      upsert: jest.fn(() => ({
        data: [{ user_id: "test-user-id", key: "theme_preference", value: "dark" }],
        error: null,
      })),
    })),
  },
}));

describe("ParametresUtilisateurPage", () => {
  const mockCurrentUser: Profile = {
    id: "test-user-id",
    email: "test@example.com",
    role: "user",
    nom: "Test User",
    avatar: null,
    color: "#FFFFFF",
    statut: "actif",
  };

  it("affiche l'état de chargement initial", () => {
    render(<ParametresUtilisateurPage currentUser={mockCurrentUser} />);
    expect(screen.getByText(/Chargement des paramètres.../i)).toBeInTheDocument();
  });

  it("charge et affiche la préférence de thème de l'utilisateur", async () => {
    // Override mock for this test to return data
    (supabase.from as jest.Mock).mockReturnValueOnce({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: { user_id: "test-user-id", key: "theme_preference", value: "light" },
            error: null,
          })),
        })),
      })),
    });

    render(<ParametresUtilisateurPage currentUser={mockCurrentUser} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Préférence de thème/i)).toHaveValue("light");
    });
  });

  it("permet à l'utilisateur de modifier et de sauvegarder la préférence de thème", async () => {
    render(<ParametresUtilisateurPage currentUser={mockCurrentUser} />);

    // Wait for initial loading to finish and input to be available
    await waitFor(() => {
      expect(screen.getByLabelText(/Préférence de thème/i)).toBeInTheDocument();
    });

    const themeInput = screen.getByLabelText(/Préférence de thème/i);
    await userEvent.clear(themeInput);
    await userEvent.type(themeInput, "dark");

    expect(themeInput).toHaveValue("dark");

    const saveButton = screen.getByRole("button", {
      name: /Sauvegarder les paramètres/i,
    });
    await userEvent.click(saveButton);

    expect(saveButton).toHaveTextContent(/Sauvegarde.../i);

    await waitFor(() => {
      expect(supabase.from("settings").upsert).toHaveBeenCalledWith(
        { user_id: "test-user-id", key: "theme_preference", value: "dark" },
        { onConflict: "user_id,key" }
      );
      expect(saveButton).toHaveTextContent(/Sauvegarder les paramètres/i);
    });
  });

  it("affiche un message d'erreur si le chargement des paramètres échoue", async () => {
    (supabase.from as jest.Mock).mockReturnValueOnce({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: null,
            error: { message: "Network error", code: "500" },
          })),
        })),
      })),
    });

    render(<ParametresUtilisateurPage currentUser={mockCurrentUser} />);

    await waitFor(() => {
      expect(screen.getByText(/Erreur: Network error/i)).toBeInTheDocument();
    });
  });

  it("affiche un message d'erreur si la sauvegarde des paramètres échoue", async () => {
    (supabase.from as jest.Mock).mockReturnValueOnce({ // For initial fetch
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: null,
            error: { code: "PGRST116", message: "No rows found" },
          })),
        })),
      })),
    });
    (supabase.from as jest.Mock).mockReturnValueOnce({ // For upsert
      upsert: jest.fn(() => ({
        data: null,
        error: { message: "Database write error", code: "500" },
      })),
    });

    render(<ParametresUtilisateurPage currentUser={mockCurrentUser} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Préférence de thème/i)).toBeInTheDocument();
    });

    const themeInput = screen.getByLabelText(/Préférence de thème/i);
    await userEvent.type(themeInput, "dark");

    const saveButton = screen.getByRole("button", {
      name: /Sauvegarder les paramètres/i,
    });
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Erreur: Database write error/i)).toBeInTheDocument();
    });
  });
});
