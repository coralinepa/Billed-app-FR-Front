import VerticalLayout from "./VerticalLayout.js";
import ErrorPage from "./ErrorPage.js";
import LoadingPage from "./LoadingPage.js";

import Actions from "./Actions.js";

const row = (bill) => {
  return `
    <tr>
      <td>${bill.type}</td>
      <td>${bill.name}</td>
      <td>${bill.date}</td>
      <td>${bill.amount} €</td>
      <td>${bill.status}</td>
      <td>
        ${Actions(bill.fileUrl)}
      </td>
    </tr>
    `;
};

//Paramètre: data - un tableau d'objets, où chaque objet représente une facture (bill).
//Retourne: Une chaîne de caractères qui est le résultat de la génération de lignes HTML pour chaque élément de data, trié par date en ordre décroissant.
const rows = (data) => {
  //Cette condition vérifie si data n'est pas nul ou indéfini et si data a une longueur supérieure à zéro
  return data && data.length
    ? data
        //Cette ligne trie les éléments du tableau en fonction de la date, de manière décroissante. Le tri est effectué par comparaison des dates des éléments a et b. Si la date de a est inférieure à celle de b, a sera placé après b dans l'ordre (d'où le retour de 1).
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        //Après avoir trié les éléments, la fonction map applique la fonction row à chaque élément du tableau. La fonction row est supposée générer une chaîne HTML représentant une ligne pour chaque facture.
        .map((bill) => row(bill))
        //La méthode join combine toutes les chaînes générées par map en une seule chaîne, sans séparateur (en utilisant une chaîne vide comme séparateur).
        .join("")
    : //Si data est nul, indéfini ou vide, la fonction retourne une chaîne vide.
      "";
};

export default ({ data: bills, loading, error }) => {
  const modal = () => `
    <div class="modal fade" id="modaleFile" data-testid="modaleFile" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLongTitle">Justificatif</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
          </div>
        </div>
      </div>
    </div>
  `;

  if (loading) {
    return LoadingPage();
  } else if (error) {
    return ErrorPage(error);
  }

  return `
    <div class='layout'>
      ${VerticalLayout(120)}
      <div class='content'>
        <div class='content-header'>
          <div class='content-title'> Mes notes de frais </div>
          <button type="button" data-testid='btn-new-bill' class="btn btn-primary">Nouvelle note de frais</button>
        </div>
        <div id="data-table">
        <table id="example" class="table table-striped" style="width:100%">
          <thead>
              <tr>
                <th>Type</th>
                <th>Nom</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
          </thead>
          <tbody data-testid="tbody">
            ${rows(bills)}
          </tbody>
          </table>
        </div>
      </div>
      ${modal()}
    </div>`;
};
