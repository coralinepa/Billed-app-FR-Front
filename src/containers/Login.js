import { ROUTES_PATH } from "../constants/routes.js";
export let PREVIOUS_LOCATION = "";

//La classe Login est utilisée pour gérer le processus de connexion pour les employés et les administrateurs
//Propriétés : document, localStorage, onNavigate, PREVIOUS_LOCATION, et store.
//Sélection des formulaires : Sélectionne les formulaires d'employé et d'administrateur et leur ajoute des écouteurs d'événements pour gérer la soumission.
export default class Login {
  constructor({
    document,
    localStorage,
    onNavigate,
    PREVIOUS_LOCATION,
    store,
  }) {
    this.document = document;
    this.localStorage = localStorage;
    this.onNavigate = onNavigate;
    this.PREVIOUS_LOCATION = PREVIOUS_LOCATION;
    this.store = store;
    const formEmployee = this.document.querySelector(
      `form[data-testid="form-employee"]`
    );
    formEmployee.addEventListener("submit", this.handleSubmitEmployee);
    const formAdmin = this.document.querySelector(
      `form[data-testid="form-admin"]`
    );
    formAdmin.addEventListener("submit", this.handleSubmitAdmin);
  }

  //Empêche le comportement par défaut de soumission du formulaire.
  //Crée un objet user avec les informations de l'utilisateur.
  //Stocke l'utilisateur dans localStorage.
  //Tente de connecter l'utilisateur en appelant this.login(user). Si cela échoue, crée un nouvel utilisateur.
  //Navigation vers la page des factures (Bills) après une connexion réussie et met à jour PREVIOUS_LOCATION.
  handleSubmitEmployee = (e) => {
    e.preventDefault();
    const user = {
      type: "Employee",
      email: e.target.querySelector(`input[data-testid="employee-email-input"]`)
        .value,
      password: e.target.querySelector(
        `input[data-testid="employee-password-input"]`
      ).value,
      status: "connected",
    };
    this.localStorage.setItem("user", JSON.stringify(user));
    this.login(user)
      .catch((err) => this.createUser(user))
      .then(() => {
        this.onNavigate(ROUTES_PATH["Bills"]);
        this.PREVIOUS_LOCATION = ROUTES_PATH["Bills"];
        PREVIOUS_LOCATION = this.PREVIOUS_LOCATION;
        this.document.body.style.backgroundColor = "#fff";
      });
  };

  //Méthode handleSubmitAdmin
  //Cette méthode fonctionne de la même manière que handleSubmitEmployee, mais pour les administrateurs, naviguant vers le tableau de bord (Dashboard).
  handleSubmitAdmin = (e) => {
    e.preventDefault();
    const user = {
      type: "Admin",
      email: e.target.querySelector(`input[data-testid="admin-email-input"]`)
        .value,
      password: e.target.querySelector(
        `input[data-testid="admin-password-input"]`
      ).value,
      status: "connected",
    };
    console.log(user);
    this.localStorage.setItem("user", JSON.stringify(user));
    this.login(user)
      .catch((err) => this.createUser(user))
      .then(() => {
        this.onNavigate(ROUTES_PATH["Dashboard"]);
        this.PREVIOUS_LOCATION = ROUTES_PATH["Dashboard"];
        PREVIOUS_LOCATION = this.PREVIOUS_LOCATION;
        document.body.style.backgroundColor = "#fff";
      });
  };

  // not need to cover this function by tests
  login = (user) => {
    if (this.store) {
      return this.store
        .login(
          JSON.stringify({
            email: user.email,
            password: user.password,
          })
        )
        .then(({ jwt }) => {
          localStorage.setItem("jwt", jwt);
        });
    } else {
      return null;
    }
  };

  // not need to cover this function by tests
  createUser = (user) => {
    if (this.store) {
      return this.store
        .users()
        .create({
          data: JSON.stringify({
            type: user.type,
            name: user.email.split("@")[0],
            email: user.email,
            password: user.password,
          }),
        })
        .then(() => {
          console.log(`User with ${user.email} is created`);
          return this.login(user);
        });
    } else {
      return null;
    }
  };
}
