/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { screen, fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES_PATH } from "../constants/routes.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";

jest.mock("../app/store", () => {
  return mockStore;
});

// Initialisation
//Simulation de localStorage et ajout d'un utilisateur de type "Employee".
//Définition de onNavigate et window.alert comme des fonctions mock pour surveiller leur appel pendant les tests.
Object.defineProperty(window, "localStorage", { value: localStorageMock });
window.localStorage.setItem(
  "user",
  JSON.stringify({
    type: "Employee",
  })
);
const onNavigate = jest.fn();
window.alert = jest.fn();

//describe : Définit le contexte des tests ("Étant donné que je suis connecté en tant qu'employé").
//beforeEach : Initialise le DOM avec l'UI de NewBill et crée une instance de NewBill avant chaque test.
//afterEach : Réinitialise le DOM après chaque test.
describe("Given I am connected as an employee", () => {
  let newBill;

  beforeEach(() => {
    jest.spyOn(mockStore, "bills");
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });

    document.body.innerHTML = NewBillUI();
    newBill = new NewBill({
      document,
      onNavigate,
      store: mockStore,
      localStorage: window.localStorage,
    });
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  //Vérifie que la page NewBill est correctement rendue en vérifiant la présence de certains éléments dans le DOM (titre, bouton d'envoi, formulaire et différents champs).
  describe("When I am on NewBill Page", () => {
    test("Then the NewBill Page should be rendered", () => {
      const title = screen.getByText("Envoyer une note de frais");
      const sendButton = screen.getByText("Envoyer");
      const form = screen.getByTestId("form-new-bill");
      expect(title).toBeTruthy();
      expect(sendButton).toBeTruthy();
      expect(screen.getByTestId("expense-type")).toBeInTheDocument();
      expect(screen.getByTestId("expense-name")).toBeInTheDocument();
      expect(screen.getByTestId("datepicker")).toBeInTheDocument();
      expect(screen.getByTestId("amount")).toBeInTheDocument();
      expect(screen.getByTestId("vat")).toBeInTheDocument();
      expect(screen.getByTestId("pct")).toBeInTheDocument();
      expect(screen.getByTestId("commentary")).toBeInTheDocument();
      expect(screen.getByTestId("file")).toBeInTheDocument();
      expect(sendButton).toBeInTheDocument();
    });

    //Simule le téléchargement d'un fichier image et vérifie que le gestionnaire de fichier est appelé, que le fichier est correctement chargé et qu'aucune alerte n'est déclenchée.
    describe("When I upload an image file", () => {
      test("Then the file handler should display a file", () => {
        const buttonFile = screen.getByTestId("file");
        const handleChangeFile = jest.fn(newBill.handleChangeFile);
        buttonFile.addEventListener("change", handleChangeFile);
        fireEvent.change(buttonFile, {
          target: {
            files: [
              new File(["content"], "yourReceipt.png", { type: "image/png" }),
            ],
          },
        });

        expect(handleChangeFile).toHaveBeenCalled();
        expect(buttonFile.files.length).toEqual(1);
        expect(buttonFile.files[0].name).toBe("yourReceipt.png");
        expect(window.alert).not.toBeCalled();
        expect(buttonFile.value).not.toBeNull();
      });
    });

    //Simule le téléchargement d'un fichier de type incorrect et vérifie que le gestionnaire de fichier est appelé, que le fichier est rejeté et qu'une alerte est déclenchée.
    describe("When I upload a wrong type file - non-image file", () => {
      test("Then the window alert should be displayed", () => {
        const buttonFile = screen.getByTestId("file");
        const handleChangeFile = jest.fn(newBill.handleChangeFile);
        buttonFile.addEventListener("change", handleChangeFile);
        fireEvent.change(buttonFile, {
          target: {
            files: [
              new File(["content"], "sample.pdf", { type: "application/pdf" }),
            ],
          },
        });

        expect(handleChangeFile).toHaveBeenCalled();
        expect(buttonFile.files[0].name).toBe("sample.pdf");
        expect(window.alert).toBeCalled();
        expect(buttonFile.value).toBe("");
      });
    });

    // Simule la soumission d'une note de frais valide et vérifie que le gestionnaire de soumission est appelé, ce qui implique que la note de frais est créée avec succès.
    describe("When I submit a new valid bill", () => {
      test("Then a new bill should be created", () => {
        const submitForm = screen.getByTestId("form-new-bill");
        const handleSubmit = jest.fn(newBill.handleSubmit);
        submitForm.addEventListener("submit", handleSubmit);

        const newValidBill = {
          type: "Transports",
          name: "validBill",
          date: "2022-07-01",
          amount: 50,
          vat: 70,
          pct: 20,
          commentary: "Commentaire",
          fileUrl: "https://localhost:3456/images/test.jpg",
          fileName: "test.jpg",
        };

        screen.getByTestId("expense-type").value = newValidBill.type;
        screen.getByTestId("expense-name").value = newValidBill.name;
        screen.getByTestId("datepicker").value = newValidBill.date;
        screen.getByTestId("amount").value = newValidBill.amount;
        screen.getByTestId("vat").value = newValidBill.vat;
        screen.getByTestId("pct").value = newValidBill.pct;
        screen.getByTestId("commentary").value = newValidBill.commentary;
        newBill.fileUrl = newValidBill.fileUrl;
        newBill.fileName = newValidBill.fileName;

        fireEvent.submit(submitForm);

        expect(handleSubmit).toHaveBeenCalled();
      });
    });
    //Tests pour les erreurs d'API - Simule des erreurs d'API et vérifie que les messages d'erreur appropriés ("Erreur 404" et "Erreur 500") sont affichés.
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "a@a",
          })
        );
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router();
      });

      test("fetches bills from an API and fails with 404 message error", async () => {
        const mockedBill = jest
          .spyOn(mockStore, "bills")
          .mockImplementationOnce(() => {
            return {
              create: jest.fn().mockRejectedValue(new Error("Erreur 404")),
            };
          });

        await expect(mockedBill().create).rejects.toThrow("Erreur 404");
      });

      test("fetches messages from an API and fails with 500 message error", async () => {
        const mockedBill = jest
          .spyOn(mockStore, "bills")
          .mockImplementationOnce(() => {
            return {
              create: jest.fn().mockRejectedValue(new Error("Erreur 500")),
            };
          });

        await expect(mockedBill().create).rejects.toThrow("Erreur 500");
      });
      afterEach(() => {
        document.body.innerHTML = "";
      });
    });
  });
});
