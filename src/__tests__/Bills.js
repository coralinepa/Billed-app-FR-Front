/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";

//Simule la connexion en tant qu'employé.
//Navigue vers la page des factures.
//Vérifie que l'icône des factures est surlignée en vérifiant la classe CSS appliqué
describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      expect(windowIcon).toHaveClass("active-icon");
    });
    //Verification de l'ordre des factures - Affiche les factures et vérifie qu'elles sont triées de la récente à la plus
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({
        data: bills,
      });
      document.body.innerHTML = BillsUI({
        data: bills,
      });

      // Extraire les dates du DOM
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);

      // Fonction de tri anti-chronologique
      const antiChrono = (a, b) => (a < b ? 1 : -1);

      // Trier les dates extraites
      const datesSorted = [...dates].sort(antiChrono);

      // Vérifier que les dates sont dans le bon ordre
      expect(dates).toEqual(datesSorted);
    });
  });
});
// Test interaction sur la page des factures - Simule le clic sur l'icône œil pour ouvrir une modal et vérifie que la modal est bien ouverte.
describe("Given I am connected as Employee and I am on Bill page", () => {
  describe("When I click on the icon eye", () => {
    test("A modal should open", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      document.body.innerHTML = BillsUI({
        data: bills,
      });
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const store = null;
      const billsView = new Bills({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });

      const eye = screen.getAllByTestId("icon-eye");

      const handleClickIconEye = jest.fn(billsView.handleClickIconEye(eye[0]));
      eye[0].addEventListener("click", handleClickIconEye);
      userEvent.click(eye[0]);
      expect(handleClickIconEye).toHaveBeenCalled();

      const modale = screen.getByTestId("modaleFile");
      expect(modale).toBeTruthy();
    });
  });
  // Navigation pour la page des nouvelles factures - Simule le clic sur le bouton "Nouvelle facture" et vérifie que l'utilisateur est redirigé vers la page de création de facture.
  describe("When I click on the New Bill button", () => {
    test("It should open the New Bill page", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const onNavigate = jest.fn();
      const store = null;
      const billsClass = new Bills({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });
      const btnNewBill = screen.getByTestId("btn-new-bill");
      const handleClickNewBill = jest.fn(billsClass.handleClickNewBill);
      btnNewBill.addEventListener("click", handleClickNewBill);
      userEvent.click(btnNewBill);
      expect(handleClickNewBill).toHaveBeenCalled();
    });
  });
});

jest.mock("../app/store", () => {
  return mockStore;
});
// Test de récupération des factures depuis l'API mock / Simule la récupération des factures depuis une API mock et vérifie que les factures sont triées correctement.
describe("Given I am connected as an employee", () => {
  describe("When I navigate to Bill page", () => {
    test("fetches bills from mock API GET", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
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
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });

      test("fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });

        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
      afterEach(() => {
        document.body.innerHTML = "";
      });
    });
  });
});
