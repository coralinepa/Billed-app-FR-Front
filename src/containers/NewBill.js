import { ROUTES_PATH } from "../constants/routes.js";
import Logout from "./Logout.js";

//Le constructeur de la classe NewBill prend un objet contenant document, onNavigate, store, et localStorage comme arguments. Ces objets sont utilisés pour manipuler le DOM, naviguer entre les pages, interagir avec le stockage local et accéder à l'API de l'application.
export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    //es gestionnaires d'événements sont attachés au formulaire de nouvelle facture et à l'entrée de fichier pour détecter les soumissions de formulaire et les changements de fichier.
    const formNewBill = this.document.querySelector(
      `form[data-testid="form-new-bill"]`
    );
    formNewBill.addEventListener("submit", this.handleSubmit);
    const file = this.document.querySelector(`input[data-testid="file"]`);
    file.addEventListener("change", this.handleChangeFile);

    //Les propriétés fileUrl, fileName, et billId sont initialisées à null. Une instance de Logout est créée pour gérer la déconnexion.
    this.fileUrl = null;
    this.fileName = null;
    this.billId = null;
    new Logout({ document, localStorage, onNavigate });
  }

  //Cette méthode est appelée lorsque l'utilisateur sélectionne un fichier. Elle vérifie le type de fichier, crée un formulaire de données, et envoie une requête pour stocker le fichier si le type est valide. Sinon, elle affiche une alerte et réinitialise l'entrée de fichier.
  handleChangeFile = (e) => {
    e.preventDefault();
    const file = this.document.querySelector(`input[data-testid="file"]`)
      .files[0];
    const filePath = e.target.value.split(/\\/g);
    const fileType = file.name.split(".").pop();
    const fileName = filePath[filePath.length - 1];
    const formData = new FormData();
    const allowedTypes = ["jpg", "jpeg", "png", "JPG", "JPEG", "PNG"];
    const email = JSON.parse(localStorage.getItem("user")).email;
    formData.append("file", file);
    formData.append("email", email);

    if (allowedTypes.includes(fileType)) {
      this.store
        .bills()
        .create({
          data: formData,
          headers: {
            noContentType: true,
          },
        })
        .then(({ fileUrl, key }) => {
          console.log(fileUrl);
          this.billId = key;
          this.fileUrl = fileUrl;
          this.fileName = fileName;
        })
        .catch((error) => console.error(error));
    } else {
      const fileInput = this.document.querySelector(
        'input[data-testid="file"]'
      );
      const fileValue = fileInput.value;
      alert("Invalid file type");
      fileInput.value = null;
    }
  };

  //Cette méthode est appelée lors de la soumission du formulaire. Elle crée un objet bill avec les informations de la facture et appelle updateBill pour mettre à jour la facture dans le store, puis navigue vers la page des factures.

  handleSubmit = (e) => {
    e.preventDefault();
    const email = JSON.parse(localStorage.getItem("user")).email;
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(
        e.target.querySelector(`input[data-testid="amount"]`).value
      ),
      date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct:
        parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) ||
        20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`)
        .value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: "pending",
    };
    this.updateBill(bill);
    this.onNavigate(ROUTES_PATH["Bills"]);
  };

  //Cette méthode envoie une requête pour mettre à jour la facture avec les données fournies et navigue vers la page des factures une fois l'opération réussie.
  updateBill = (bill) => {
    if (this.store) {
      this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: this.billId })
        .then(() => {
          this.onNavigate(ROUTES_PATH["Bills"]);
        })
        .catch((error) => console.error(error));
    }
  };
}
