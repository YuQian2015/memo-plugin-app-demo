// import { EditorView } from "@tiptap/pm/view";

export const handleImageUpload = (
  file: File,
  // view: EditorView,
  // event: ClipboardEvent | DragEvent | Event,
) => {
  // check if the file is an image
  if (!file.type.includes("image/")) {
    alert("File type not supported.");

    // check if the file size is less than 50MB
  } else if (file.size / 1024 / 1024 > 50) {
    alert("File size too big (max 50MB).");
  } else {
    // const reader = new FileReader();
    // reader.onload = (e) => {
    //   const { schema } = view.state;
    //   const node = schema.nodes.image.create({
    //     src: e.target?.result,
    //     alt: file,
    //     title: file.name,
    //   }); // creates the image element
    //   const transaction = view.state.tr.replaceSelectionWith(node);
    //   view.dispatch(transaction);
    // };
    // reader.readAsDataURL(file);

    // insertImage('string');
  }

  // const insertImage = (url: string) => {
  //   // for paste events
  //   if (event instanceof ClipboardEvent) {
  //     return view.dispatch(
  //       view.state.tr.replaceSelectionWith(
  //         view.state.schema.nodes.image.create({
  //           src: url,
  //           alt: file.name,
  //           title: file.name,
  //         }),
  //       ),
  //     );

  //     // for drag and drop events
  //   } else if (event instanceof DragEvent) {
  //     const { schema } = view.state;
  //     const coordinates = view.posAtCoords({
  //       left: event.clientX,
  //       top: event.clientY,
  //     });
  //     const node = schema.nodes.image.create({
  //       src: url,
  //       alt: file.name,
  //       title: file.name,
  //     }); // creates the image element
  //     const transaction = view.state.tr.insert(coordinates?.pos || 0, node); // places it in the correct position
  //     return view.dispatch(transaction);

  //     // for input upload events
  //   } else if (event instanceof Event) {
  //     return view.dispatch(
  //       view.state.tr.replaceSelectionWith(
  //         view.state.schema.nodes.image.create({
  //           src: url,
  //           alt: file.name,
  //           title: file.name,
  //         }),
  //       ),
  //     );
  //   }
  // };
};
