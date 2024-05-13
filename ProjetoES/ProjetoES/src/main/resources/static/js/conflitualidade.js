document.getElementById("apply-filters").addEventListener("click", function () {
  const course = document.getElementById("course-filter").value;
  const subject = document.getElementById("subject-filter").value;
  const startDate = document.getElementById("date-start").value;
  const endDate = document.getElementById("date-end").value;

  // Simulação de dados filtrados
  const nodes = [
    { id: 1, label: "Aula 1", group: course },
    { id: 2, label: "Aula 2", group: subject },
    { id: 3, label: "Aula 3", group: course },
  ];

  const edges = [
    { from: 1, to: 2 },
    { from: 1, to: 3 },
  ];

  const container = document.getElementById("graph-container");
  const data = {
    nodes: new vis.DataSet(nodes),
    edges: new vis.DataSet(edges),
  };
  const options = {
    groups: {
      [course]: { color: { background: "red" } },
      [subject]: { color: { background: "blue" } },
    },
  };
  new vis.Network(container, data, options);
});
