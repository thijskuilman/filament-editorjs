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

class Advertisement {
  static get toolbox() {
    return {
      title: 'Advertisement',
      icon: '<svg width="17" height="15" viewBox="0 0 336 276" xmlns="http://www.w3.org/2000/svg"><path d="M291 150V79c0-19-15-34-34-34H79c-19 0-34 15-34 34v42l67-44 81 72 56-29 42 30zm0 52l-43-30-56 30-81-67-66 39v23c0 19 15 34 34 34h178c17 0 31-13 34-29zM79 0h178c44 0 79 35 79 79v118c0 44-35 79-79 79H79c-44 0-79-35-79-79V79C0 35 35 0 79 0z"/></svg>'
    };
  }

  render(){
    this.wrapper = document.createElement('div');
    const span = document.createElement('span');

    this.wrapper.appendChild(span);

    this.wrapper.style = 'background-color: #6366f1; border-radius: 5px; padding: 15px 10px; color: #fff; text-align: center';

    span.innerText = 'Advertisement';

    return this.wrapper;
  }

  save(blockContent){
    return {
      url: blockContent.value
    }
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
          if (this.tools.includes("advertisement")) enabledTools.advertisement = Advertisement;

          if (this.tools.includes("embed")) {

            let collectibleRegex = new RegExp('http[s]?:\\/\\/' + window.location.host + '\\/([^/]*\\/)?collectibles\\/([^\\s]+)?.*');

            enabledTools.embed = {
              class: CustomEditorJSEmbed,
              config: {
                services: {
                  youtube: true,
                  coub: true,
                  collectible: {
                    regex: new RegExp(collectibleRegex),
                    embedUrl: window.location.origin + '/collectibles/<%= remote_id %>/embed',
                    html: "<iframe height='115px' scrolling='no' frameborder='no' allowtransparency='true' style='width: 100%;'></iframe>",
                    height: 300,
                    width: 600,
                    caption: false,
                    id: (groups) => {
                      return groups.at(-1);
                    }
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
