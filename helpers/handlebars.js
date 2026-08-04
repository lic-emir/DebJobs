const handlebars = require('handlebars');

module.exports = {
  seleccionarSkills: (seleccionadas = [], opciones) => {
    const skills = ['HTML5', 'CSS3', 'CSSGrid', 'Flexbox', 'JavaScript', 'jQuery', 'Node', 'Angular', 'VueJS', 'ReactJS', 'React Hooks', 'Redux', 'Apollo', 'GraphQL', 'TypeScript', 'PHP', 'Laravel', 'Symfony', 'Python', 'Django', 'ORM', 'Sequelize', 'Mongoose', 'SQL', 'MVC', 'SASS', 'WordPress'];
    let html = '';

    skills.forEach(skill => {
      html += `
        <li ${seleccionadas.includes(skill) ? 'class="activo"' : ''}>${skill}</li>
      `;
    });
    return new handlebars.SafeString(html);
  },
  tipoContrato: (seleccionado, opciones) => {
    return opciones.fn(this).replace(
      new RegExp(`value="${seleccionado}"`), '$& selected="selected"'
    )
  },
  mostrarAlertas: (errores = {}, opciones) => {
    const categorias = Object.keys(errores);
    let html = '';

    categorias.forEach(categoria => {
      if (errores[categoria].length) {
        errores[categoria].forEach(mensaje => {
          html += `<div class="${categoria} alerta">${mensaje}</div>`;
        });
      }
    });

    return html;
  }
}