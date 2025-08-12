import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUp from "../Credential/Sign-up/sign-up";
import DocsType from "../Pages/Select-Docs-type/DocsType";
import DocsForm from "../Pages/Docs-Form/DocsForm";
import GenerateDocs from "../Pages/GenerateDocs/GenerateDocs";
import RecentDocsView from "../Recent-Docs-View/RecentDocsView";
import About from "../Pages/About-Zoom-Docs/about";

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={< DocsType/>} />
        <Route path="/SignUp" element={< SignUp/>} />
        <Route path="/about" element={< About/>} />
        <Route path=":docstype/Template" element={<DocsForm/>}/>
        <Route path=":docstype/Template/generate" element={<GenerateDocs/>}/>
        <Route path="/View-Recent-Documents/:filePath" element={<RecentDocsView/>}/>
      </Routes>
    </Router>
  );
}
