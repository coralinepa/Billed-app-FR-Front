import { ROUTES_PATH } from "../constants/routes.js";
import { formatDate, formatStatus } from "../app/format.js";
import Logout from "./Logout.js";

//Le constructeur de la classe prend un objet contenant document, onNavigate, store, et localStorage comme arguments. Ces objets sont utilisés pour manipuler le DOM, naviguer entre les pages, interagir avec le stockage local et accéder à l'API de l'application.
export default class {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;

    //un gestionnaire d'événement est attaché au bouton de création d'une nouvelle facture. Si le bouton existe, un événement click est écouté pour appeler la méthode handleClickNewBill.
    const buttonNewBill = document.querySelector(
      `button[data-testid="btn-new-bill"]`
    );
    if (buttonNewBill)
      buttonNewBill.addEventListener("click", this.handleClickNewBill);

    //De même, des gestionnaires d'événements sont attachés à tous les éléments ayant l'attribut data-testid="icon-eye". Chaque icône écoute un événement click pour appeler la méthode handleClickIconEye.
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`);
    if (iconEye)
      iconEye.forEach((icon) => {
        icon.addEventListener("click", () => this.handleClickIconEye(icon));
      });
    //Une instance de Logout est créée pour gérer la déconnexion.
    new Logout({ document, localStorage, onNavigate });
  }
  //Méthode pour naviguer vers la création d'une nouvelle facture
  //Cette méthode est appelée lorsque l'icône "œil" est cliquée. Elle affiche une image de la facture dans une fenêtre modale (modaleFile). La largeur de l'image est ajustée à 50 % de la largeur de la fenêtre modale.
  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH["NewBill"]);
  };

  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url");
    const imgWidth = Math.floor($("#modaleFile").width() * 0.5);
    $("#modaleFile")
      .find(".modal-body")
      .html(
        `<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`
      );
    if (typeof $("#modaleFile").modal === "function")
      $("#modaleFile").modal("show");
  };

  //Méthode pour récupérer les factures
  //Cette méthode récupère les factures à partir du store. Si le store est défini, elle appelle store.bills().list() pour obtenir la liste des factures. Chaque facture est formatée avec formatDate et formatStatus. En cas d'erreur de formatage, l'erreur est capturée et la date non formatée est utilisée. La méthode retourne finalement la liste des factures ou lance une erreur en cas d'échec.
  getBills = () => {
    if (this.store) {
      return this.store
        .bills()
        .list()
        .then((snapshot) => {
          const bills = snapshot
            .sort((a, b) => (a.date < b.date ? 1 : -1))
            .map((doc) => {
              try {
                return {
                  ...doc,
                  date: formatDate(doc.date),
                  status: formatStatus(doc.status),
                };
              } catch (e) {
                // if for some reason, corrupted data was introduced, we manage here failing formatDate function
                // log the error and return unformatted date in that case
                console.log(e, "for", doc);
                return {
                  ...doc,
                  date: doc.date,
                  status: formatStatus(doc.status),
                };
              }
            });
          console.log("length", bills.length);
          return bills;
        });
    }
  };
}
