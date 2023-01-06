import EditorJS from "@editorjs/editorjs";
import ImageTool from "@editorjs/image";
import List from "@editorjs/list";
import Header from "@editorjs/header";
import Underline from "@editorjs/underline";
import Code from "@editorjs/code";
import InlineCode from "@editorjs/inline-code";
import Quote from "@editorjs/quote";
import Table from "@editorjs/table";
import RawTool from "@editorjs/raw";
import Delimiter from "@editorjs/delimiter";
import {StyleInlineTool} from "editorjs-style";
import DragDrop from "editorjs-drag-drop";
import Embed from '@editorjs/embed';

export default class CustomEditorJSEmbed extends Embed {
  render() {
    this.element = Embed.prototype.render.call(this);

    if (this.element.querySelector('.embed-tool__caption')) {
      this.element.querySelector('.embed-tool__caption').remove();
    }
    return this.element;
  }
}

document.addEventListener("alpine:init", () => {
  Alpine.data(
      "editorjs",
      ({state, statePath, placeholder, readOnly, tools, minHeight}) => ({
        instance: null,
        state: state,
        tools: tools,
        init() {
          let enabledTools = {};

          if (this.tools.includes("header")) enabledTools.header = Header;

          if (this.tools.includes("image")) {
            enabledTools.image = {
              class: ImageTool,
              config: {
                uploader: {
                  uploadByFile: (file) => {
                    return new Promise((resolve) => {
                      this.$wire.upload(
                          `componentFileAttachments.${statePath}`,
                          file,
                          (uploadedFilename) => {
                            this.$wire
                                .getComponentFileAttachmentUrl(statePath)
                                .then((url) => {
                                  if (!url) {
                                    return resolve({
                                      success: 0,
                                    });
                                  }
                                  return resolve({
                                    success: 1,
                                    file: {
                                      url: url,
                                    },
                                  });
                                });
                          }
                      );
                    });
                  },

                  uploadByUrl: (url) => {
                    return this.$wire.loadImageFromUrl(url).then((result) => {
                      return {
                        success: 1,
                        file: {
                          url: result,
                        },
                      };
                    });
                  },
                },
              },
            };
          }
          if (this.tools.includes("delimiter")) enabledTools.delimiter = Delimiter;
          if (this.tools.includes("list")) enabledTools.list = List;
          if (this.tools.includes("underline")) enabledTools.underline = Underline;
          if (this.tools.includes("quote")) enabledTools.quote = Quote;
          if (this.tools.includes("table")) enabledTools.table = Table;
          if (this.tools.includes("raw")) enabledTools.raw = RawTool;
          if (this.tools.includes("code")) enabledTools.code = Code;
          if (this.tools.includes("inline-code")) enabledTools.inlineCode = InlineCode;
          if (this.tools.includes("style")) enabledTools.style = StyleInlineTool;
          if (this.tools.includes("style")) enabledTools.style = StyleInlineTool;

          if (this.tools.includes("embed")) {

            enabledTools.embed = {
              class: CustomEditorJSEmbed,
              config: {
                services: {
                  youtube: true,
                  coub: true,
                  collectible: {
                    regex: new RegExp('http[s]?:\/\/' + window.location.host + '\/.*\/collectibles\/([^\/\?\&]+)?.*'),
                    embedUrl: window.location.origin + '/en/collectibles/<%= remote_id %>/embed',
                    html: "<iframe height='115px' scrolling='no' frameborder='no' allowtransparency='true' style='width: 100%;'></iframe>",
                    height: 300,
                    width: 600,
                    caption: false,
                    id: (groups) => groups.join('/embed/')
                  }
                }
              }
            }
          }
          ;

          this.instance = new EditorJS({
            holder: this.$el,
            minHeight: minHeight,
            data: this.state,
            placeholder: placeholder,
            readOnly: readOnly,
            tools: enabledTools,

            onChange: () => {
              this.instance.save().then((outputData) => {
                this.state = outputData;
              });
            },
            onReady: () => {
              new DragDrop(this.instance);
            },
          });
        },
      })
  );
});
