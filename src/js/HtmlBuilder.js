(function(MK) {
    MK.HtmlBuilder = function() {
        // Singleton :)
        if (!MK.HtmlBuilderInstance && this == MK) {
            MK.HtmlBuilderInstance = new MK.HtmlBuilder();
        }

        return MK.HtmlBuilderInstance;
    }

    MK.extend(MK.HtmlBuilder.prototype, {
        build: function(obj) {
            var i, node, nodes;

            if (obj.length) {
                while ((node = obj[i++])) {
                    nodes.push(this.buildNode(node));
                }

                return nodes;
            } else {
                return this.buildNode(obj);
            }
        },

        buildNode: function(node) {
            var element = document.createElement(node.n), attribute;

            if ('a' in node) {
                for (attribute in node.a) {
                    element.setAttribute(attribute, node.a[attribute]);
                }
            }

            if ('h' in node) {
                element.innerHTML = node.h;
            }

            if ('t' in node) {
                element.innerText = node.t;
            }

            if ('c' in node) {
                for (var i = 0; i < node.c.length; i++)
                    element.appendChild(this.buildNode(node.c[i]));
            }

            if ('e' in node) {
                for (event in node.e)
                    element[('on' + event)] = node.e[event];
            }

            return element;
        }
    });
})(MK);

