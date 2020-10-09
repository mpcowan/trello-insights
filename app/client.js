window.Promise = window.TrelloPowerUp.Promise;

window.TrelloPowerUp.initialize({
  'board-buttons': () => [{
    text: 'Insights',
    callback: (ctx) => ctx.get('member', 'private', 'token')
      .then((token) => {
        if (!token) {
          return ctx.popup({
            args: {
              idBoard: ctx.getContext().board,
            },
            title: 'Authorize Your Account',
            url: './auth.html',
            height: 75,
          });
        }

        return ctx.modal({
          args: {
            idBoard: ctx.getContext().board,
          },
          url: './board-summary.html',
          accentColor: '#6C547B',
          fullscreen: true,
          title: 'Board Insights',
        });
      }),
  }],
  'list-actions': (t) => t.list('name')
    .then((list) => [{
      text: 'Insights',
      callback: (context) => context.get('member', 'private', 'token')
        .then((token) => {
          if (!token) {
            return context.popup({
              args: {
                idBoard: context.getContext().board,
                idList: context.getContext().list,
                list: list.name,
              },
              title: 'Authorize Your Account',
              url: './auth.html',
              height: 75,
            });
          }

          return context.modal({
            args: {
              idBoard: context.getContext().board,
              idList: context.getContext().list,
            },
            url: './list-summary.html',
            accentColor: '#6C547B',
            fullscreen: true,
            title: `Insights for: ${list.name}`,
          });
        }),
    }]),
});
