module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    categoryIds: {
      type: 'json',
      custom: (value) => {
        if (!Array.isArray(value)) {
          return false;
        }

        return value.every((id) => {
          if (!Number.isFinite(id) && typeof id !== 'string') {
            return false;
          }

          if (typeof id === 'string' && !/^[0-9]+$/.test(id)) {
            return false;
          }

          return true;
        });
      },
      required: true,
    },
  },

  exits: {
    projectNotFound: {
      responseType: 'notFound',
    },
    notEnoughRights: {
      responseType: 'forbidden',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const project = await Project.qm.getOneById(inputs.id);

    if (!project) {
      throw 'projectNotFound';
    }

    const projectManager = await ProjectManager.qm.getOneByProjectIdAndUserId(
      project.id,
      currentUser.id,
    );

    if (!projectManager) {
      throw 'notEnoughRights';
    }

    await ProjectCategoryAssignment.destroy({
      projectId: inputs.id,
    });

    const projectCategoryAssignments = await Promise.all(
      inputs.categoryIds.map((categoryId) =>
        ProjectCategoryAssignment.create({
          categoryId,
          projectId: inputs.id,
        })
          .tolerate('E_UNIQUE')
          .fetch(),
      ),
    ).then((assignments) => assignments.filter((assignment) => assignment));

    return {
      item: project,
      projectCategoryAssignments,
    };
  },
};
