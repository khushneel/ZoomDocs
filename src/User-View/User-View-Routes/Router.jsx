import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUp from "../Credential/Sign-up/sign-up";
import DocsType from "../Pages/Select-Docs-type/DocsType";
import DocsTemplate from "../Pages/Choose-Template/DocsTemplate";
import DocsForm from "../Pages/Docs-Form/DocsForm";
import GenerateDocs from "../Pages/GenerateDocs/GenerateDocs";

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={< DocsType/>} />
        <Route path="/SignUp" element={< SignUp/>} />
        <Route path=":docstype" element={<DocsTemplate/>}/>
        <Route path=":docstype/Template" element={<DocsForm/>}/>
        <Route path=":docstype/Template/generate" element={<GenerateDocs/>}/>
      </Routes>
    </Router>
  );
}
